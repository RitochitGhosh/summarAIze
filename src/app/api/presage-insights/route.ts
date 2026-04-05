import { auth } from "@/lib/auth";
import { getMeetingInsights } from "@/lib/presage";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meetingId, summary } = (await req.json()) as {
        meetingId: string;
        summary: string;
    };

    if (!meetingId || !summary) {
        return NextResponse.json({ error: "Missing meetingId or summary" }, { status: 400 });
    }

    const insights = await getMeetingInsights({ meetingId, summary });
    return NextResponse.json(insights);
}
