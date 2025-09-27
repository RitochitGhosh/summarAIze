import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

import { SignInView } from "@/modules/auth/ui/views/sign-in-view";

const Page = async () => {
    // console.log("Sign in page!"); // server
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!!session) {
        redirect("/");
    }

    return <SignInView />
}

export default Page;