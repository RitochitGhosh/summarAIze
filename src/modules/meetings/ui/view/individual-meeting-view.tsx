"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ActiveState } from "@/components/active-state";
import { CancelledState } from "@/components/cancelled-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { ProcessingState } from "@/components/processing-state";
import { UpcomingState } from "@/components/upcoming-state";
import { useConfirm } from "@/hooks/use-confirm";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { IndividualMeetingHeader } from "../components/individual-meeting-header";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";

interface IndividualAgentProps {
    meetingId: string;
}

export const IndividualMeetingView = ({ meetingId }: IndividualAgentProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const trpc = useTRPC();

    const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] = useState(false);

    const { data } = useSuspenseQuery(trpc.meetings.getOne.queryOptions({
        id: meetingId
    }));

    const removeMeeting = useMutation(trpc.meetings.remove.mutationOptions({
        onSuccess: async () => {
            await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
            // TODO: Invalidate Free tier usage
            toast.success("Deleted meeting successfully!")
            router.push("/meetings");
        },
        onError: (error) => {
            toast.error(error.message)
        }
    }));

    const [RemoveConfirmation, confirmRemove] = useConfirm(
        "Are you sure?",
        `The following action will remove this meeting`,
    );

    const handleRemoveMeeting = async () => {
        const ok = await confirmRemove();

        if (!ok) return;

        await removeMeeting.mutateAsync({ id: meetingId })
    };

    const isActive = data.status === "active";
    const isUpcoming = data.status === "upcoming";
    const isCancelled = data.status === "cancelled";
    const isCompleted = data.status === "completed";
    const isProcessing = data.status === "processing";

    return (
        <>
            <RemoveConfirmation />
            <UpdateMeetingDialog
                open={updateMeetingDialogOpen}
                onOpenChange={setUpdateMeetingDialogOpen}
                initialValues={data}
            />
            <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
                <IndividualMeetingHeader
                    meetingId={meetingId}
                    meetingName={data.name}
                    onEdit={() => setUpdateMeetingDialogOpen(true)}
                    onRemove={handleRemoveMeeting}
                />
                {isUpcoming && (
                    <UpcomingState
                        meetingId={meetingId}
                        onCancelMeeting={() => { }}
                        isCancelling={false}
                    />
                )}
                {isActive && (
                    <ActiveState
                        meetingId={meetingId}
                    />
                )}
                {isCompleted && (
                    <div className="">
                        completetd
                    </div>
                )}
                {isProcessing && (
                   <ProcessingState />
                )}
                {isCancelled && (
                    <CancelledState />
                )}
            </div>
        </>
    )
}

export const IndividualMeetingViewLoading = () => {
    return (
        <LoadingState
            title="Loading your meeting"
            description="This may take a few seconds"
        />
    )
}

export const IndividualMeetingViewError = () => {
    return (
        <ErrorState
            title="Error in loading meeting"
            description="Something went wrong"
        />
    )
}