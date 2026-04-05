"use client"

import { ErrorState } from "@/components/error-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CallProvider } from "../components/call-provider";

interface Props {
    meetingId: string;
}

export const CallView = ({ meetingId }: Props) => {
    const trpc = useTRPC();
    // Use getForCall so any authenticated participant (not just the owner)
    // can join via a shared link.
    const { data } = useSuspenseQuery(trpc.meetings.getForCall.queryOptions({ id: meetingId }));

    if (data.status === "completed") {
        return (
            <div className="flex h-screen items-center justify-center">
                <ErrorState
                    title="Meeting has ended"
                    description="You can no longer join this meeting"
                />
            </div>
        )
    }

    return <CallProvider meetingId={meetingId} meetingName={data.name} />
}
