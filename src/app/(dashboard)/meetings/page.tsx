import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient, trpc } from "@/trpc/server";
import { MeetingsView, MetingsViewError, MetingsViewLoading } from "@/modules/meetings/ui/view/meetings-view";
import { MeetingsListHeaders } from "@/modules/meetings/ui/components/meetings-list-header";
import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/meetings/params";

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

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({
        ...filters,
    }))

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