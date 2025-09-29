import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getQueryClient, trpc } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { auth } from "@/lib/auth";
import { IndividualAgentsViewError, IndividualAgentsViewLoading, IndividualAgentView } from "@/modules/agents/ui/views/individual-agent-view";


interface Props {
    params: Promise<{ agentId: string }>
}

const Page = async ({
    params
}: Props) => {
    const { agentId } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    const queryClient = getQueryClient();
    // Prefetch the agent for the client
    void queryClient.prefetchQuery(
        trpc.agents.getOne.queryOptions({
            id: agentId
        })
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<IndividualAgentsViewLoading />}>
                <ErrorBoundary fallback={<IndividualAgentsViewError />}>
                    <IndividualAgentView agentId={agentId} />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}

export default Page;