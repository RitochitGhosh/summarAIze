import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import OpenAI from "openai";

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schemas";
import { MeetingStatus } from "../types";
import { streamVideo } from "@/lib/stream-video";
import { generateAvatarUri } from "@/lib/avatar";
import { searchWebWithGemini } from "@/lib/gemini-web-search";

function shouldUseWebSearch(question: string, recentChatContext: string) {
    const text = `${question}\n${recentChatContext}`.toLowerCase();

    return /(latest|current|recent|today|news|web|online|live|happening|update|started|start|result|results|score|scores|schedule|ipl|stock|price|weather)/.test(text);
}

export const meetingsRouter = createTRPCRouter({
    generatetoken: protectedProcedure.mutation(async ({ ctx }) => {
        await streamVideo.upsertUsers([
            {
                id: ctx.auth.user.id,
                name: ctx.auth.user.name,
                role: "admin",
                image: ctx.auth.user.image ?? generateAvatarUri({ seed: ctx.auth.user.name, variant: "initials" }),
            },
        ]);

        const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hr
        const issuedAt = Math.floor(Date.now() / 1000) - 60;

        const token = streamVideo.generateUserToken({
            user_id: ctx.auth.user.id,
            exp: expirationTime,
            validity_in_seconds: issuedAt,
        });

        return token;
    }),

    getMany: protectedProcedure
        .input(z.object({
            page: z.number().default(DEFAULT_PAGE),
            pageSize: z.number()
                .min(MIN_PAGE_SIZE)
                .max(MAX_PAGE_SIZE)
                .default(DEFAULT_PAGE_SIZE),
            search: z.string().nullish(),
            agentId: z.string().nullish(),
            status: z.enum([
                MeetingStatus.Upcoming,
                MeetingStatus.Active,
                MeetingStatus.Completed,
                MeetingStatus.Processing,
                MeetingStatus.Cancelled,
            ]).nullish(),
        }))
        .query(async ({ ctx, input }) => {
            const { search, page, pageSize, status, agentId } = input;

            const data = await db
                .select({
                    ...getTableColumns(meetings),
                    agent: agents,
                    duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
                })
                .from(meetings)
                .innerJoin(agents, eq(meetings.agentId, agents.id))
                .where(and(
                    eq(meetings.userId, ctx.auth.user.id),
                    search ? ilike(meetings.name, `%${search.trim()}%`) : undefined,
                    status ? eq(meetings.status, status) : undefined,
                    agentId ? eq(meetings.agentId, agentId) : undefined,
                ))
                .orderBy(desc(meetings.createdAt), desc(meetings.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize);

            const [total] = await db
                .select({ count: count() })
                .from(meetings)
                .innerJoin(agents, eq(meetings.agentId, agents.id))
                .where(and(
                    eq(meetings.userId, ctx.auth.user.id),
                    search ? ilike(meetings.name, `%${search.trim()}%`) : undefined,
                    status ? eq(meetings.status, status) : undefined,
                    agentId ? eq(meetings.agentId, agentId) : undefined,
                ));

            const totalPages = Math.ceil(total.count / pageSize);

            return {
                items: data,
                total: total.count,
                totalPages,
            };
        }),

    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const [existingMeeting] = await db
                .select({
                    ...getTableColumns(meetings),
                    agent: agents,
                    duration: sql<number>`EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
                })
                .from(meetings)
                .innerJoin(agents, eq(meetings.agentId, agents.id))
                .where(
                    and(
                        eq(meetings.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id),
                    )
                );

            if (!existingMeeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" })
            }

            return existingMeeting;
        }),

    create: protectedProcedure
        .input(meetingsInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const [createdMeeting] = await db
                .insert(meetings)
                .values({
                    ...input,
                    userId: ctx.auth.user.id,
                })
                .returning();

            // TODO: Create Stream Call, Upsert Stream users
            const call = streamVideo.video.call("default", createdMeeting.id);
            await call.create({
                data: {
                    created_by_id: ctx.auth.user.id,
                    custom: {
                        meetingId: createdMeeting.id,
                        meetingName: createdMeeting.name,
                    },
                    settings_override: {
                        transcription: {
                            language: "en",
                            mode: "auto-on",
                            closed_caption_mode: "auto-on",
                        },
                        recording: {
                            mode: "auto-on",
                            quality: "1080p",
                        },
                    },
                }
            });

            const [existingAgent] = await db
                .select()
                .from(agents)
                .where(eq(agents.id, createdMeeting.agentId));

            if (!existingAgent) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Agent not found",
                });
            }

            await streamVideo.upsertUsers([
                {
                    id: existingAgent.id,
                    name: existingAgent.name,
                    role: "user",
                    image: generateAvatarUri({
                        seed: existingAgent.name,
                        variant: "botttsNeutral",
                    }),
                },
            ]);

            return createdMeeting;
        }),

    update: protectedProcedure
        .input(meetingsUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const [updatedMeeting] = await db
                .update(meetings)
                .set(input)
                .where(
                    and(
                        eq(meetings.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                )
                .returning();

            if (!updatedMeeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" })
            }

            return updatedMeeting;

        }),

    remove: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const [removedMeeting] = await db
                .delete(meetings)
                .where(
                    and(
                        eq(meetings.id, input.id),
                        eq(meetings.userId, ctx.auth.user.id)
                    )
                )
                .returning();

            if (!removedMeeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" })
            }

            return removedMeeting;
        }),

    // Returns minimal meeting info (name + status) for any authenticated user.
    // Used so invited participants can join a call without being the meeting owner.
    getForCall: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const [meeting] = await db
                .select({
                    id: meetings.id,
                    name: meetings.name,
                    status: meetings.status,
                })
                .from(meetings)
                .where(eq(meetings.id, input.id));

            if (!meeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
            }

            return meeting;
        }),

    // Ask a question about a completed meeting using its summary as context.
    askAi: protectedProcedure
        .input(z.object({
            meetingId: z.string(),
            question: z.string().min(1).max(500),
            chatHistory: z.array(z.object({
                role: z.enum(["user", "ai"]),
                text: z.string().min(1).max(4000),
            })).max(12).default([]),
        }))
        .mutation(async ({ ctx, input }) => {
            const [meeting] = await db
                .select({
                    id: meetings.id,
                    name: meetings.name,
                    summary: meetings.summary,
                    elevenLabsTranscript: meetings.elevenLabsTranscript,
                })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.id, input.meetingId),
                        eq(meetings.userId, ctx.auth.user.id),
                    )
                );

            if (!meeting) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
            }

            if (!meeting.summary) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Meeting summary is not available yet.",
                });
            }

            const context = [
                `Meeting: ${meeting.name}`,
                `Summary:\n${meeting.summary}`,
                meeting.elevenLabsTranscript
                    ? `Transcript:\n${meeting.elevenLabsTranscript}`
                    : "",
            ]
                .filter(Boolean)
                .join("\n\n");

            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const recentChatContext = input.chatHistory
                .slice(-8)
                .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.text}`)
                .join("\n");
            const forceWebSearch = Boolean(process.env.GEMINI_API_KEY) && shouldUseWebSearch(input.question, recentChatContext);

            if (forceWebSearch) {
                const searchResult = await searchWebWithGemini({
                    question: input.question,
                    meetingContext: context,
                    chatContext: recentChatContext,
                });

                return {
                    answer: searchResult.answer,
                    sources: searchResult.sources,
                };
            }

            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                {
                    role: "system",
                    content:
                        "You are a helpful meeting assistant. Use the meeting context first. Answer directly and concisely. If the answer is not in the meeting context, say so plainly.",
                },
                {
                    role: "user",
                    content: [
                        "Use this meeting context and recent chat history to answer the current question.",
                        `Meeting context:\n${context}`,
                        recentChatContext ? `Recent chat history:\n${recentChatContext}` : "",
                        `Current question:\n${input.question}`,
                    ]
                        .filter(Boolean)
                        .join("\n\n"),
                },
            ];

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages,
            });

            return {
                answer: response.choices[0].message.content ?? "No answer generated.",
                sources: [],
            };
        }),
})