import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MeetingsView, MetingsViewError, MetingsViewLoading } from "@/modules/meetings/ui/view/meetings-view";
import { MeetingsListHeaders } from "@/modules/meetings/ui/components/meetings-list-header";
import { auth } from "@/lib/auth";

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}))

    return (
        <>
            <MeetingsListHeaders />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<MetingsViewLoading />}>
                    <ErrorBoundary fallback={<MetingsViewError />}>
                        <MeetingsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    )
}

export default Page;