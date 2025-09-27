"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonAlertIcon } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" })
});

export const SignInView = () => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setError(null);
        setPending(true);

        authClient.signIn.email(
            {
                email: data.email,
                password: data.password
            },
            {
                onSuccess: () => {
                    setPending(false);
                    router.push("/");
                },
                onError: ({ error }) => {
                    setPending(false);
                    setError(error.message);
                }
            }
        );
    };

    const onSocial = (provider: "google" | "github") => {
        setError(null);
        setPending(false);

        authClient.signIn.social(
            {
                provider,
                callbackURL: "/"
            },
            {
                onSuccess: () => setPending(false),
                onError: ({ error }) => {
                    setPending(false);
                    setError(error.message);
                }
            }
        );
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <Card className="overflow-hidden w-full max-w-4xl shadow-xl rounded-2xl">
                <CardContent className="grid md:grid-cols-2 p-0">
                    {/* Left side: form */}
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col justify-center gap-6 w-full h-full px-8 py-10"
                        >
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">Welcome back</h1>
                                <p className="text-muted-foreground text-balance">
                                    Log in to your account
                                </p>
                            </div>

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="you@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="●●●●●●●●" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!!error && (
                                <Alert className="bg-destructive/10 border-none">
                                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                                    <AlertTitle>{error}</AlertTitle>
                                </Alert>
                            )}

                            <Button disabled={pending} type="submit" className="w-full">
                                Sign in
                            </Button>

                            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:flex after:items-center after:border-t after:border-border">
                                <span className="bg-card text-muted-foreground relative z-10 px-2">
                                    Or continue with
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    disabled={pending}
                                    variant="outline"
                                    type="button"
                                    onClick={() => onSocial("google")}
                                >
                                    <FaGoogle />
                                </Button>
                                <Button
                                    disabled={pending}
                                    variant="outline"
                                    type="button"
                                    onClick={() => onSocial("github")}
                                >
                                    <FaGithub />
                                </Button>
                            </div>

                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/sign-up"
                                    className="underline underline-offset-4"
                                >
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </Form>

                    {/* Right side: gradient panel */}
                    <div className="bg-radial from-sidebar-accent to-sidebar hidden md:flex h-full flex-col gap-y-4 items-center justify-center rounded-r-2xl">
                        <img src="/logo.svg" alt="Logo" className="h-[92px] w-[92px]" />
                        <p className="text-2xl font-semibold text-white">SummarAIze</p>
                    </div>

                </CardContent>
            </Card>

            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking to continue, you agree to our{" "}
                <a href="#">Terms of service</a> and{" "}
                <a href="#">Privacy Policy</a>
            </div>
        </div>
    );
};
