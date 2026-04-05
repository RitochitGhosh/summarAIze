"use client";

import {
    CheckIcon,
    SparklesIcon,
    ZapIcon,
    StarIcon,
    MicIcon,
    BotIcon,
    VideoIcon,
    TrendingUpIcon,
    InfinityIcon,
    ShieldIcon,
    UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const FREE_FEATURES = [
    { icon: VideoIcon, text: "Up to 3 meetings / month" },
    { icon: BotIcon, text: "1 AI agent" },
    { icon: SparklesIcon, text: "GPT-4o meeting summaries" },
    { icon: UsersIcon, text: "Invite participants via link" },
];

const PRO_FEATURES = [
    { icon: InfinityIcon, text: "Unlimited meetings" },
    { icon: BotIcon, text: "Unlimited AI agents" },
    { icon: SparklesIcon, text: "GPT-4o summaries + Ask AI Q&A" },
    { icon: MicIcon, text: "ElevenLabs Scribe transcript (speaker-diarized)" },
    { icon: TrendingUpIcon, text: "Presage meeting insights & predictions" },
    { icon: VideoIcon, text: "1080p recordings — 90-day retention" },
    { icon: UsersIcon, text: "Unlimited participants per call" },
    { icon: ShieldIcon, text: "Priority support" },
];

export const UpgradeView = () => {
    return (
        <div className="flex-1 py-8 px-4 md:px-8 overflow-y-auto">
            {/* Header */}
            <div className="max-w-3xl mx-auto text-center mb-10 flex flex-col gap-y-3">
                <div className="flex items-center justify-center gap-x-2">
                    <StarIcon className="size-6 text-yellow-500 fill-yellow-400" />
                    <h1 className="text-3xl font-bold tracking-tight">Upgrade to Pro</h1>
                </div>
                <p className="text-muted-foreground text-base max-w-xl mx-auto">
                    Unlock the full power of summarAIze — powered by{" "}
                    <span className="font-semibold text-orange-600">ElevenLabs</span> and{" "}
                    <span className="font-semibold text-violet-600">Presage</span>.
                </p>
            </div>

            {/* Pricing cards */}
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Free */}
                <div className="rounded-xl border bg-white p-6 flex flex-col gap-y-5 shadow-sm">
                    <div className="flex flex-col gap-y-1">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Free</p>
                        <p className="text-4xl font-bold">₹ 0</p>
                        <p className="text-sm text-muted-for
                        eground">Forever free</p>
                    </div>
                    <Separator />
                    <ul className="flex flex-col gap-y-3 flex-1">
                        {FREE_FEATURES.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-x-2 text-sm">
                                <CheckIcon className="size-4 text-green-500 shrink-0" />
                                <Icon className="size-4 text-muted-foreground shrink-0" />
                                {text}
                            </li>
                        ))}
                    </ul>
                    <Button variant="outline" className="w-full" disabled>
                        Current plan
                    </Button>
                </div>

                {/* Pro */}
                <div className="rounded-xl border-2 border-primary bg-white p-6 flex flex-col gap-y-5 shadow-md relative">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">
                        Most popular
                    </Badge>
                    <div className="flex flex-col gap-y-1">
                        <p className="text-sm font-medium text-primary uppercase tracking-wide">Pro</p>
                        <div className="flex items-end gap-x-1">
                            <p className="text-4xl font-bold">₹ 299</p>
                            <p className="text-sm text-muted-foreground mb-1">/ month</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Billed monthly</p>
                    </div>
                    <Separator />
                    <ul className="flex flex-col gap-y-3 flex-1">
                        {PRO_FEATURES.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-x-2 text-sm">
                                <CheckIcon className="size-4 text-green-500 shrink-0" />
                                <Icon className="size-4 text-muted-foreground shrink-0" />
                                {text}
                            </li>
                        ))}
                    </ul>
                    <Button className="w-full gap-x-2">
                        <ZapIcon className="size-4" />
                        Upgrade to Pro
                    </Button>
                </div>
            </div>

            {/* Partner badges */}
            <div className="max-w-3xl mx-auto">
                <p className="text-center text-xs text-muted-foreground mb-4 uppercase tracking-widest">
                    Powered by our technology partners
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <PartnerBadge
                        name="ElevenLabs"
                        description="Speech-to-text & voice AI"
                        color="orange"
                        icon={<MicIcon className="size-5" />}
                    />
                    <PartnerBadge
                        name="Presage"
                        description="Predictive meeting analytics"
                        color="violet"
                        icon={<TrendingUpIcon className="size-5" />}
                    />
                </div>
            </div>

            {/* Ads coming soon */}
            <div className="max-w-3xl mx-auto mt-10">
                <div className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-5 text-center flex flex-col gap-y-2">
                    <div className="flex items-center justify-center gap-x-2 text-muted-foreground">
                        <ZapIcon className="size-4" />
                        <p className="text-sm font-medium">Advertising</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Sponsored content and partner integrations will be available here soon.
                        <br />
                        Upgrade to Pro to enjoy an ad-free experience.
                    </p>
                    <div className="mt-2 h-16 rounded-lg bg-muted/60 border border-dashed flex items-center justify-center text-xs text-muted-foreground/50">
                        Ad space — coming soon
                    </div>
                </div>
            </div>
        </div>
    );
};


// ---------------------------------------------------------------------------
// Partner badge component
// ---------------------------------------------------------------------------

type BadgeColor = "orange" | "violet";

const BADGE_STYLES: Record<BadgeColor, string> = {
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
};

function PartnerBadge({
    name,
    description,
    color,
    icon,
}: {
    name: string;
    description: string;
    color: BadgeColor;
    icon: React.ReactNode;
}) {
    return (
        <div
            className={`flex items-center gap-x-3 rounded-xl border px-5 py-3 ${BADGE_STYLES[color]}`}
        >
            <span>{icon}</span>
            <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-xs opacity-70">{description}</p>
            </div>
        </div>
    );
}
