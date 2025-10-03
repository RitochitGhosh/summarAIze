
import { EmptyState } from "./empty-state";

export const ProcessingState = () => {
    return (
        <div className="bg-white rounded-lg py-5 px-4 flex flex-col gap-y-8 items-center justify-center">
            <EmptyState
                image="/processing.svg"
                title="Meeting completed"
                description="This meeting was completed, a summary will appear soon"
            />
        </div>
    )
}