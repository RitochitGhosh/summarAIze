import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { AgentsView, AgentsViewError, AgentsViewLoading } from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";

const Page = async () => {
    // This could have been done from the view section also but this approach of fetching in the server, makes it faster (preferrable)
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions());

    return (

        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<AgentsViewLoading />} >
                <ErrorBoundary fallback={<AgentsViewError />} >
                    <AgentsView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}

export default Page;