"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { UpdateAgentDialog } from "@/modules/agents/ui/components/update-agent-dialog";
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
    }

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
                <div className="bg-white rounded-lg border">
                    <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
                        <div className="flex items-center gap-x-3">
                            <GeneratedAvatar
                                variant="botttsNeutral"
                                seed={data.name}
                                className="size-10"
                            />
                            <h2 className="text-2xl font-medium">
                                {data.name}
                            </h2>
                        </div>
                        <Badge
                            variant={"outline"}
                            className="flex items-center gap-x-2 [&>svg]:size-4"
                        >
                            <VideoIcon className="text-blue-700" />
                        </Badge>
                        <div className="flex flex-col gap-y-4">
                          
                        </div>
                    </div>
                </div>
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