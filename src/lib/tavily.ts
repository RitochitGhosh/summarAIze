import "server-only";

const TAVILY_API_URL = "https://api.tavily.com/search";

export interface TavilySource {
    title: string;
    url: string;
    content: string;
    score?: number;
}

interface TavilySearchResponse {
    query?: string;
    answer?: string;
    results?: Array<{
        title?: string;
        url?: string;
        content?: string;
        score?: number;
    }>;
}

export async function searchWebWithTavily(params: {
    query: string;
    chatContext?: string;
}) {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        throw new Error("TAVILY_API_KEY is not set");
    }

    const contextualQuery = [
        params.query.trim(),
        params.chatContext?.trim()
            ? `Conversation context:\n${params.chatContext.trim()}`
            : "",
    ]
        .filter(Boolean)
        .join("\n\n");

    const response = await fetch(TAVILY_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            query: contextualQuery,
            topic: "general",
            search_depth: "advanced",
            max_results: 5,
            include_answer: true,
            include_raw_content: false,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Tavily search failed: ${error}`);
    }

    const data = (await response.json()) as TavilySearchResponse;

    const sources: TavilySource[] = (data.results ?? [])
        .filter((item): item is Required<Pick<TavilySource, "title" | "url" | "content">> & { score?: number } =>
            Boolean(item.title && item.url && item.content)
        )
        .map((item) => ({
            title: item.title,
            url: item.url,
            content: item.content,
            score: item.score,
        }));

    return {
        answer: data.answer ?? "",
        sources,
    };
}