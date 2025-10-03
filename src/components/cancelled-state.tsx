import { EmptyState } from "./empty-state";

export const CancelledState = () => {
    return (
        <div className="bg-white rounded-lg py-5 px-4 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image="/cancelled.svg"
                title="Meeting cancelled"
                description="This meeting was cancelled"
            />
        </div>
    )
}