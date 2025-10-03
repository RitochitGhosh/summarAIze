import { AlertCircleIcon } from "lucide-react";
import Image from "next/image";

interface EmptyProps {
    title: string;
    description: string;
    image?: string;
};

export const EmptyState = ({
    title,
    description,
    image = "/empty.svg"
}: EmptyProps) => {
    return (
        <div className="flex flex-col items-center justify-center rounded">

            <Image src={image} alt="Empty" width={240} height={240} />
            <div className="flex flex-col gap-y-6 max-w-md mx-auto text-center">
                <h6 className="text-lg font-medium"> {title} </h6>
                <p className="text-sm text-muted-foreground"> {description} </p>
            </div>

        </div>
    )
}