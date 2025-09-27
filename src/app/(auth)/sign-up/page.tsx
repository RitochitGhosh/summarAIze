import { auth } from "@/lib/auth"
import { SignUpView } from "@/modules/auth/ui/views/sign-up-view"
import { headers } from "next/headers"
import { redirect } from "next/navigation";

const Page = async () => {
  // console.log("Sign up page!"); // server

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!!session) {
    redirect("/");
  }

  return <SignUpView />
}

export default Page