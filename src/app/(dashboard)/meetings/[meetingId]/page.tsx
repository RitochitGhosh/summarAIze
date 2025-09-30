

interface Props {
    params: Promise<{ meetingId: string }>
}

const Page = async ({ params }: Props) => {
    const { meetingId } = await params;

    return (
        <div className="">
            {meetingId}
        </div>
    )
}

export default Page;