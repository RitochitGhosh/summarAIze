"use client"

import { ChevronRightIcon, MoreVerticalIcon, PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface IndividualMeetingHeaderProps {
    meetingId: string;
    meetingName: string;
    onEdit: () => void;
    onRemove: () => void;
}

export const IndividualMeetingHeader = ({
    meetingId,
    meetingName,
    onEdit,
    onRemove
}: IndividualMeetingHeaderProps) => {

    return (
        <div className="flex items-center justify-between">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="font-medium text-xl">
                            <Link href={"/meetings"}>My Meetings</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <ChevronRightIcon className="text-foreground text-xl font-medium [&>svg]:size-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="font-medium text-xl text-foreground">
                            <Link href={`/meetings/${meetingId}`}>
                                {meetingName}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Without modal={false}, the dialog that this dropdown opens cause the website to get unclickable */}

            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant={"ghost"}
                    >
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <PencilIcon className="size-4 text-black" />
                        Edit
                    </DropdownMenuItem><DropdownMenuItem onClick={onRemove}>
                        <TrashIcon className="size-4 text-black" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}