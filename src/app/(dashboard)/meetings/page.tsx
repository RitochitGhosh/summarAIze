import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { MeetingsView, MetingsViewError, MetingsViewLoading } from "@/modules/meetings/ui/view/meetings-view";

const Page = () => {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={ <MetingsViewLoading /> }>
                <ErrorBoundary fallback={ <MetingsViewError /> }>
                    <MeetingsView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}

export default Page;