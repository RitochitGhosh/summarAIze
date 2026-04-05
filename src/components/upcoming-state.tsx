"use client";

import { BanIcon, VideoIcon, CopyIcon, CheckIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "./empty-state";
import { Button } from "./ui/button";

interface UpcomingStateProps {
    meetingId: string;
    onCancelMeeting: () => void;
    isCancelling: boolean;
}

export const UpcomingState = ({
    meetingId,
    onCancelMeeting,
    isCancelling,
}: UpcomingStateProps) => {
    const [copied, setCopied] = useState(false);

    const meetingUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/call/${meetingId}`
            : `/call/${meetingId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(meetingUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback: select a hidden input
        }
    };

    return (
        <div className="bg-white rounded-lg py-5 px-4 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image="/upcoming.svg"
                title="Not started yet"
                description="Once you start this meeting, a summary will appear here"
            />
            <div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
                <Button
                    variant={"secondary"}
                    className="w-full lg:w-auto"
                    onClick={onCancelMeeting}
                    disabled={isCancelling}
                >
                    <BanIcon />
                    Cancel meeting
                </Button>
                <Button asChild disabled={isCancelling} className="w-full lg:w-auto">
                    <Link href={`/call/${meetingId}`}>
                        <VideoIcon />
                        Start meeting
                    </Link>
                </Button>
            </div>

            {/* Invite friends section */}
            <div className="w-full border rounded-lg px-4 py-4 flex flex-col gap-y-3 bg-muted/40">
                <div className="flex items-center gap-x-2 text-sm font-medium">
                    <UsersIcon className="size-4 text-muted-foreground" />
                    Invite friends to join
                </div>
                <p className="text-xs text-muted-foreground">
                    Share this link with anyone — they&apos;ll join as a participant once the meeting starts.
                </p>
                <div className="flex items-center gap-x-2">
                    <code className="flex-1 truncate rounded bg-background border text-xs px-3 py-2 text-muted-foreground select-all">
                        {meetingUrl}
                    </code>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopy}
                        className="shrink-0"
                    >
                        {copied ? (
                            <CheckIcon className="size-4 text-green-600" />
                        ) : (
                            <CopyIcon className="size-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};