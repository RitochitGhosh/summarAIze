import "server-only";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

export interface ElevenLabsWord {
    text: string;
    type: "word" | "punctuation" | "spacing";
    start: number;
    end: number;
    speaker_id?: string;
}

export interface ElevenLabsTranscriptResponse {
    text: string;
    words: ElevenLabsWord[];
    language_code: string;
    language_probability: number;
}

/**
 * Transcribes audio/video from a URL using ElevenLabs Scribe.
 * @param audioUrl - Public URL to the audio or video recording.
 * @returns Formatted transcript string with speaker labels.
 */
export async function transcribeWithElevenLabs(audioUrl: string): Promise<string> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");

    const formData = new FormData();
    formData.append("model_id", "scribe_v2");
    formData.append("source_url", audioUrl);
    formData.append("diarize", "true");
    formData.append("timestamps_granularity", "word");

    const response = await fetch(`${ELEVENLABS_API_URL}/speech-to-text`, {
        method: "POST",
        headers: {
            "xi-api-key": apiKey,
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs transcription failed: ${error}`);
    }

    const data: ElevenLabsTranscriptResponse = await response.json();

    // Group consecutive words by speaker and format nicely
    const lines: string[] = [];
    let currentSpeaker: string | undefined = undefined;
    let currentLine = "";

    for (const word of data.words ?? []) {
        if (word.type === "spacing") {
            currentLine += word.text;
            continue;
        }

        if (word.type !== "word" && word.type !== "punctuation") continue;

        const speaker = word.speaker_id ?? "Unknown";

        if (speaker !== currentSpeaker) {
            if (currentLine.trim()) {
                lines.push(`**${formatSpeakerId(currentSpeaker)}:** ${currentLine.trim()}`);
            }
            currentSpeaker = speaker;
            currentLine = word.text;
        } else {
            currentLine += word.type === "punctuation" ? word.text : ` ${word.text}`;
        }
    }

    if (currentLine.trim()) {
        lines.push(`**${formatSpeakerId(currentSpeaker)}:** ${currentLine.trim()}`);
    }

    return lines.length > 0 ? lines.join("\n\n") : data.text;
}

function formatSpeakerId(speakerId: string | undefined): string {
    if (!speakerId) return "Speaker";
    // speaker_0 → Speaker 1
    const match = speakerId.match(/(\d+)$/);
    if (match) return `Speaker ${parseInt(match[1]) + 1}`;
    return speakerId;
}

/**
 * Generates a text-to-speech audio buffer from text using ElevenLabs.
 * Returns the audio as a Buffer that can be uploaded or saved.
 */
export async function generateSpeechWithElevenLabs(
    text: string,
    voiceId = "JBFqnCBsd6RMkjVDRZzb"  // default: George voice
): Promise<Buffer> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set");

    const response = await fetch(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text,
                model_id: "eleven_turbo_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs TTS failed: ${error}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
