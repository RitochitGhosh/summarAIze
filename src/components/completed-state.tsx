"use client";

import Markdown from "react-markdown";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    BookOpenTextIcon,
    SparklesIcon,
    FileTextIcon,
    FileVideoIcon,
    ClockFadingIcon,
    SendIcon,
    BotIcon,
    TrendingUpIcon,
    AlertTriangleIcon,
    CheckCircleIcon,
} from "lucide-react";

import { MeetingGetOne } from "@/modules/meetings/types";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Link from "next/link";
import { GeneratedAvatar } from "./generated-avatar";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { formatDuration } from "@/lib/utils";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

interface Props {
    data: MeetingGetOne;
}

export const CompletedState = ({ data }: Props) => {
    const trpc = useTRPC();
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState<
        { role: "user" | "ai"; text: string; sources?: { title: string; url: string }[] }[]
    >([]);

    const askAi = useMutation(
        trpc.meetings.askAi.mutationOptions({
            onSuccess: (res) => {
                setChatHistory((prev) => [
                    ...prev,
                    { role: "ai", text: res.answer, sources: res.sources },
                ]);
            },
            onError: (err) => {
                toast.error(err.message);
            },
        })
    );

    const handleAsk = () => {
        if (!question.trim()) return;
        const q = question.trim();
        const nextHistory = [...chatHistory, { role: "user" as const, text: q }];
        setChatHistory((prev) => [...prev, { role: "user", text: q }]);
        setQuestion("");
        askAi.mutate({
            meetingId: data.id,
            question: q,
            chatHistory: nextHistory.map(({ role, text }) => ({ role, text })),
        });
    };

    return (
        <div className="flex flex-col gap-y-4">
            <Tabs defaultValue="summary">
                <div className="bg-white rounded-lg border px-3">
                    <ScrollArea>
                        <TabsList className="p-0 bg-background justify-start rotate-none h-13">
                            <TabsTrigger
                                value="summary"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                            >
                                <BookOpenTextIcon />
                                Summary
                            </TabsTrigger>
                            <TabsTrigger
                                value="transcript"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                            >
                                <FileTextIcon />
                                Transcript
                            </TabsTrigger>
                            <TabsTrigger
                                value="recording"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                            >
                                <FileVideoIcon />
                                Recording
                            </TabsTrigger>
                            <TabsTrigger
                                value="chat"
                                className="text-muted-foreground rounded-none bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:text-accent-foreground h-full hover:text-accent-foreground"
                            >
                                <SparklesIcon />
                                Ask AI
                            </TabsTrigger>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>

                {/* ── Summary ── */}
                <TabsContent value="summary">
                    <div className="bg-white rounded-lg border">
                        <div className="px-4 py-5 flex flex-col col-span-5 gap-y-4">
                            <h2 className="text-2xl font-medium capitalize">
                                {data.name}
                            </h2>
                            <div className="flex gap-x-2 items-center">
                                <Link
                                    href={`/agents/${data.agentId}`}
                                    className="flex items-center gap-x-2 underline underline-offset-4 capitalize"
                                >
                                    <GeneratedAvatar
                                        variant="botttsNeutral"
                                        seed={data.agent.name}
                                        className="size-5"
                                    />
                                    {data.agent.name}
                                </Link>{" "}
                                <p className="">{data.startedAt ? format(data.startedAt, "PPP") : ""}</p>
                            </div>
                            <div className="flex gap-x-2 items-center">
                                <SparklesIcon className="size-4" />
                                <p className="">General summary</p>
                            </div>
                            <Badge
                                variant={"outline"}
                                className="flex items-center gap-x-2 [&>svg]:size-4"
                            >
                                <ClockFadingIcon className="text-blue-700" />
                                {data.duration ? formatDuration(data.duration) : "No duration"}
                            </Badge>
                            <div className="">
                                <Markdown
                                    components={{
                                        h1: (props) => <h1 className="text-2xl font-medium mb-6" {...props} />,
                                        h2: (props) => <h2 className="text-xl font-medium mb-6" {...props} />,
                                        h3: (props) => <h3 className="text-lg font-medium mb-6" {...props} />,
                                        h4: (props) => <h4 className="text-base font-medium mb-6" {...props} />,
                                        p: (props) => <p className="mb-6 leading-relaxed" {...props} />,
                                        ul: (props) => <ul className="list-disc list-inside mb-6" {...props} />,
                                        ol: (props) => <ol className="list-decimal list-inside mb-6" {...props} />,
                                        li: (props) => <li className="mb-1" {...props} />,
                                        strong: (props) => <strong className="font-semibold" {...props} />,
                                        code: (props) => (
                                            <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />
                                        ),
                                        blockquote: (props) => (
                                            <blockquote className="border-l-4 pl-4 italic my-4" {...props} />
                                        ),
                                    }}
                                >
                                    {data.summary}
                                </Markdown>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* ── ElevenLabs Transcript ── */}
                <TabsContent value="transcript">
                    <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-x-2">
                                <FileTextIcon className="size-4 text-muted-foreground" />
                                <h3 className="font-medium">Transcript</h3>
                            </div>
                            <Badge
                                variant="outline"
                                className="text-xs flex items-center gap-x-1 border-orange-300 text-orange-700 bg-orange-50"
                            >
                                <span className="inline-block size-2 rounded-full bg-orange-500" />
                                Powered by ElevenLabs Scribe
                            </Badge>
                        </div>

                        {(data as MeetingGetOne & { elevenLabsTranscript?: string | null }).elevenLabsTranscript ? (
                            <ScrollArea className="h-[480px] pr-3">
                                <Markdown
                                    components={{
                                        p: (props) => <p className="mb-4 leading-relaxed text-sm" {...props} />,
                                        strong: (props) => <strong className="font-semibold" {...props} />,
                                    }}
                                >
                                    {(data as MeetingGetOne & { elevenLabsTranscript?: string | null }).elevenLabsTranscript!}
                                </Markdown>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 gap-y-3 text-center text-muted-foreground">
                                <FileTextIcon className="size-8 opacity-40" />
                                <p className="text-sm">
                                    ElevenLabs transcript is being processed.
                                    <br />
                                    It will appear here once the recording is ready.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* ── Recording ── */}
                <TabsContent value="recording">
                    <div className="bg-white rounded-lg border px-4 py-5">
                        <video
                            src={data.recordingUrl!}
                            className="w-full rounded-lg"
                            controls
                        />
                    </div>
                </TabsContent>

                {/* ── Ask AI ── */}
                <TabsContent value="chat">
                    <div className="bg-white rounded-lg border flex flex-col h-[560px]">
                        {/* Header */}
                        <div className="flex items-center gap-x-2 px-4 py-3 border-b">
                            <BotIcon className="size-4 text-primary" />
                            <span className="font-medium text-sm">Ask AI about this meeting</span>
                            <Badge variant="secondary" className="ml-auto text-xs">
                                OpenAI + Web
                            </Badge>
                        </div>

                        {/* Chat messages */}
                        <ScrollArea className="flex-1 px-4 py-3">
                            {chatHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-y-3 text-center text-muted-foreground py-12">
                                    <SparklesIcon className="size-8 opacity-40" />
                                    <p className="text-sm">
                                        Ask anything about this meeting —<br />
                                        decisions made, action items, key topics, and more.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-y-4">
                                    {chatHistory.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${msg.role === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-foreground"
                                                    }`}
                                            >
                                                <div>{msg.text}</div>
                                                {msg.role === "ai" && msg.sources && msg.sources.length > 0 && (
                                                    <div className="mt-3 border-t border-border/60 pt-2">
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                                            Sources
                                                        </p>
                                                        <div className="flex flex-col gap-y-1">
                                                            {msg.sources.map((source) => (
                                                                <a
                                                                    key={source.url}
                                                                    href={source.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs underline underline-offset-2 break-all"
                                                                >
                                                                    {source.title}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {askAi.isPending && (
                                        <div className="flex justify-start">
                                            <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground animate-pulse">
                                                Thinking…
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Input */}
                        <div className="flex items-end gap-x-2 px-4 py-3 border-t">
                            <Textarea
                                placeholder="Ask a question about this meeting…"
                                className="resize-none min-h-[44px] max-h-[120px] text-sm"
                                rows={1}
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAsk();
                                    }
                                }}
                            />
                            <Button
                                size="icon"
                                onClick={handleAsk}
                                disabled={!question.trim() || askAi.isPending}
                            >
                                <SendIcon className="size-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* ── Presage Insights Panel ── */}
            <PresageInsightsPanel data={data} />
        </div>
    );
};


// ---------------------------------------------------------------------------
// Presage Insights Panel (client-side, calls a server action via tRPC)
// ---------------------------------------------------------------------------

const SENTIMENT_COLOR = {
    positive: "text-green-700 bg-green-50 border-green-200",
    neutral: "text-blue-700 bg-blue-50 border-blue-200",
    negative: "text-red-700 bg-red-50 border-red-200",
} as const;

function PresageInsightsPanel({ data }: Props) {
    const [insights, setInsights] = useState<{
        sentiment: "positive" | "neutral" | "negative";
        sentimentScore: number;
        engagementScore: number;
        actionItemsCount: number;
        predictedFollowUp: boolean;
        keyTopics: string[];
        riskFlags: string[];
        confidenceScore: number;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/presage-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    meetingId: data.id,
                    summary: data.summary ?? "",
                }),
            });
            if (!res.ok) throw new Error("Failed to fetch insights");
            setInsights(await res.json());
        } catch {
            toast.error("Could not load Presage insights");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border px-4 py-5 flex flex-col gap-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <TrendingUpIcon className="size-4 text-primary" />
                    <h3 className="font-medium text-sm">Meeting Insights</h3>
                </div>
                <Badge
                    variant="outline"
                    className="text-xs flex items-center gap-x-1 border-violet-300 text-violet-700 bg-violet-50"
                >
                    <span className="inline-block size-2 rounded-full bg-violet-500" />
                    Powered by Presage
                </Badge>
            </div>

            {!insights ? (
                <div className="flex flex-col items-center gap-y-3 py-6 text-center text-muted-foreground">
                    <TrendingUpIcon className="size-8 opacity-30" />
                    <p className="text-sm">Get AI-powered predictions and sentiment analysis for this meeting.</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchInsights}
                        disabled={loading}
                    >
                        {loading ? "Analysing…" : "Generate Insights"}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Sentiment */}
                    <div className={`rounded-lg border px-3 py-3 flex flex-col gap-y-1 ${SENTIMENT_COLOR[insights.sentiment]}`}>
                        <p className="text-xs font-medium uppercase tracking-wide opacity-70">Sentiment</p>
                        <p className="text-lg font-semibold capitalize">{insights.sentiment}</p>
                        <p className="text-xs">{insights.sentimentScore}/100</p>
                    </div>

                    {/* Engagement */}
                    <div className="rounded-lg border px-3 py-3 flex flex-col gap-y-1 bg-sky-50 border-sky-200 text-sky-700">
                        <p className="text-xs font-medium uppercase tracking-wide opacity-70">Engagement</p>
                        <p className="text-lg font-semibold">{insights.engagementScore}%</p>
                        <div className="w-full bg-sky-200 rounded-full h-1.5">
                            <div
                                className="bg-sky-500 h-1.5 rounded-full"
                                style={{ width: `${insights.engagementScore}%` }}
                            />
                        </div>
                    </div>

                    {/* Action items */}
                    <div className="rounded-lg border px-3 py-3 flex flex-col gap-y-1 bg-amber-50 border-amber-200 text-amber-700">
                        <p className="text-xs font-medium uppercase tracking-wide opacity-70">Action Items</p>
                        <p className="text-lg font-semibold">{insights.actionItemsCount} detected</p>
                        <p className="text-xs flex items-center gap-x-1">
                            {insights.predictedFollowUp ? (
                                <><CheckCircleIcon className="size-3" /> Follow-up likely</>
                            ) : (
                                "No follow-up predicted"
                            )}
                        </p>
                    </div>

                    {/* Confidence */}
                    <div className="rounded-lg border px-3 py-3 flex flex-col gap-y-1 bg-gray-50 border-gray-200 text-gray-700">
                        <p className="text-xs font-medium uppercase tracking-wide opacity-70">Confidence</p>
                        <p className="text-lg font-semibold">{insights.confidenceScore}%</p>
                        <p className="text-xs text-muted-foreground">Presage model v1</p>
                    </div>

                    {/* Key topics */}
                    {insights.keyTopics.length > 0 && (
                        <div className="col-span-2 rounded-lg border px-3 py-3 bg-white">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Key Topics</p>
                            <div className="flex flex-wrap gap-1">
                                {insights.keyTopics.map((t) => (
                                    <Badge key={t} variant="secondary" className="text-xs capitalize">
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Risk flags */}
                    {insights.riskFlags.length > 0 && (
                        <div className="col-span-2 rounded-lg border px-3 py-3 bg-red-50 border-red-200">
                            <p className="text-xs font-medium uppercase tracking-wide text-red-700 mb-2 flex items-center gap-x-1">
                                <AlertTriangleIcon className="size-3" />
                                Risk Flags
                            </p>
                            <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                                {insights.riskFlags.map((flag) => (
                                    <li key={flag}>{flag}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}