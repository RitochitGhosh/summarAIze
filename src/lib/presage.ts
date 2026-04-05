import "server-only";

const PRESAGE_API_URL = process.env.PRESAGE_API_URL ?? "https://api.presage.io/v1";

export interface PresageMeetingInsight {
    sentiment: "positive" | "neutral" | "negative";
    sentimentScore: number;         // 0–100
    engagementScore: number;        // 0–100
    actionItemsCount: number;
    predictedFollowUp: boolean;
    keyTopics: string[];
    riskFlags: string[];
    confidenceScore: number;        // 0–100
}

/**
 * Sends meeting summary + transcript to Presage for predictive insights.
 * Presage analyses the conversation and returns sentiment, engagement,
 * action-item predictions and risk flags.
 */
export async function getMeetingInsights(params: {
    meetingId: string;
    summary: string;
    transcript?: string;
}): Promise<PresageMeetingInsight> {
    const apiKey = process.env.PRESAGE_API_KEY;

    // If no API key / URL configured, return mock insights so the UI
    // still renders during development.
    if (!apiKey) {
        return buildMockInsights(params.summary);
    }

    const response = await fetch(`${PRESAGE_API_URL}/meeting-insights`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            meeting_id: params.meetingId,
            summary: params.summary,
            transcript: params.transcript ?? "",
        }),
    });

    if (!response.ok) {
        console.warn(`Presage API error (${response.status}) – falling back to mock insights`);
        return buildMockInsights(params.summary);
    }

    return response.json() as Promise<PresageMeetingInsight>;
}

/**
 * Lightweight heuristic-based mock so the UI works without a live Presage key.
 * Replace this with the real Presage endpoint once credentials are available.
 */
function buildMockInsights(summary: string): PresageMeetingInsight {
    const lower = summary.toLowerCase();

    const positiveWords = ["great", "success", "approved", "agree", "launch", "excellent", "complete"];
    const negativeWords = ["issue", "problem", "delay", "concern", "risk", "fail", "blocker"];

    const positiveHits = positiveWords.filter((w) => lower.includes(w)).length;
    const negativeHits = negativeWords.filter((w) => lower.includes(w)).length;

    let sentiment: "positive" | "neutral" | "negative" = "neutral";
    let sentimentScore = 50;
    if (positiveHits > negativeHits) { sentiment = "positive"; sentimentScore = 65 + positiveHits * 5; }
    else if (negativeHits > positiveHits) { sentiment = "negative"; sentimentScore = 35 - negativeHits * 5; }
    sentimentScore = Math.max(0, Math.min(100, sentimentScore));

    const actionMatches = lower.match(/\b(action|todo|follow.?up|assign|next step|will|should|must)\b/g);
    const actionItemsCount = actionMatches ? Math.min(actionMatches.length, 8) : 2;

    const keyTopicWords = summary
        .split(/\W+/)
        .filter((w) => w.length > 5)
        .slice(0, 5);

    return {
        sentiment,
        sentimentScore,
        engagementScore: 60 + Math.floor(Math.random() * 30),
        actionItemsCount,
        predictedFollowUp: actionItemsCount >= 3,
        keyTopics: [...new Set(keyTopicWords)].slice(0, 4),
        riskFlags: negativeHits > 2 ? ["High concern density detected"] : [],
        confidenceScore: 72,
    };
}
