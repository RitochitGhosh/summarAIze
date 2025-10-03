import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";

import { AgentsView, AgentsViewError, AgentsViewLoading } from "@/modules/agents/ui/views/agents-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { AgentsListHeaders } from "@/modules/agents/ui/components/agents-list-header";
import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/agents/params";

interface Props {
    searchParams: Promise<SearchParams>;
}

const Page = async ({ searchParams }: Props) => {
    const filters = await loadSearchParams(searchParams);
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    // This could have been done from the view section also but this approach of fetching in the server, makes it faster (preferrable)
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
        ...filters,
    }));

    return (
        <>
            <AgentsListHeaders />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<AgentsViewLoading />} >
                    <ErrorBoundary fallback={<AgentsViewError />} >
                        <AgentsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    )
}

export default Page;