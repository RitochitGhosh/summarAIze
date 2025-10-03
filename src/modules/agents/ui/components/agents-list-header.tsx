"use client"

import { Button } from "@/components/ui/button"
import { PlusIcon, XCircleIcon } from "lucide-react"
import { NewagentDialog } from "./new-agent-dialog"
import { useState } from "react"
import { useAgentsFilters } from "../../hooks/use-agents-filters"
import { SearchFilter } from "./agents-search-filter"
import { DEFAULT_PAGE } from "@/constants"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"


export const AgentsListHeaders = () => {
    const [filters, setFilters] = useAgentsFilters();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isAnyFilterModified = !!filters.search;

    const onClearFilters = () => {
        setFilters({
            search: "",
            page: DEFAULT_PAGE,
        })
    }

    return (
        <>
            <NewagentDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <div className="py-4 px-4 md:px-8  flex flex-col gap-y-4">
                <div className="flex items-center justify-between">
                    <h5 className="font-medium text-xl">
                        My Agents
                    </h5>
                    <Button className=""
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <PlusIcon />
                        New Agent
                    </Button>
                </div>
                <ScrollArea>
                    <div className="flex items-center gap-x-2 p-1">
                        <SearchFilter />
                        {
                            isAnyFilterModified && (
                                <Button variant={"outline"} size={"sm"} onClick={onClearFilters}>
                                    <XCircleIcon />
                                    Clear
                                </Button>
                            )
                        }
                    </div>
                    <ScrollBar orientation="horizontal"/>
                </ScrollArea>
            </div>
        </>
    )
}