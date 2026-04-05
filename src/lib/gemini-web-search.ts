import "server-only";

const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface GeminiWebSource {
    title: string;
    url: string;
}

interface GeminiGenerateContentResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
        groundingMetadata?: {
            groundingChunks?: Array<{
                web?: {
                    uri?: string;
                    title?: string;
                };
            }>;
        };
    }>;
}

export async function searchWebWithGemini(params: {
    question: string;
    meetingContext: string;
    chatContext?: string;
}) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const prompt = [
        "Answer the user's question using Google Search grounding when needed.",
        "Use the meeting context and recent chat context only as supporting context.",
        "Return a direct final answer. Do not say you are searching or checking.",
        "If the question involves time-sensitive information, include specific concrete dates.",
        `Meeting context:\n${params.meetingContext}`,
        params.chatContext?.trim() ? `Recent chat history:\n${params.chatContext.trim()}` : "",
        `Current question:\n${params.question}`,
    ]
        .filter(Boolean)
        .join("\n\n");

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
            tools: [
                {
                    google_search: {},
                },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini web search failed: ${error}`);
    }

    const data = (await response.json()) as GeminiGenerateContentResponse;
    const candidate = data.candidates?.[0];
    const answer = candidate?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";

    const sources = Array.from(
        new Map(
            (candidate?.groundingMetadata?.groundingChunks ?? [])
                .map((chunk) => ({
                    title: chunk.web?.title?.trim() ?? "",
                    url: chunk.web?.uri?.trim() ?? "",
                }))
                .filter((source) => source.title && source.url)
                .map((source) => [source.url, source])
        ).values()
    );

    return {
        answer: answer || "No answer generated.",
        sources,
    };
}