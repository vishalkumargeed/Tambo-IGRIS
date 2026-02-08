import Image from "next/image"
import {
  GitPullRequest,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react"

import SignIn from "./components/authentication/Signin"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Bento grid */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div
          className="grid auto-rows-[minmax(200px,auto)] gap-4 sm:gap-6"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
          }}
        >
          {/* Hero cell — spans 7 cols on lg */}
          <div className="col-span-12 flex flex-col justify-center lg:col-span-7">
            <Card className="h-full border-0 bg-transparent shadow-none">
              <CardContent className="flex flex-col justify-center gap-6 pt-4">
                <div>
                  <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                    Your GitHub repos and pull requests, in one place.
                  </h1>
                  <p className="mt-2 text-muted-foreground text-base sm:text-lg">
                    AI-powered PR reviews, issues, and code exploration—right
                    where you work.
                  </p>
                </div>
                <div>
                  <SignIn />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Illustration cell — spans 5 cols on lg */}
          <div className="col-span-12 flex items-center justify-center lg:col-span-5">
            <Card className="flex h-full min-h-[280px] w-full items-center justify-center overflow-hidden bg-muted/40 p-6 sm:min-h-[320px]">
              <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[320px]">
                <Image
                  src="/Affiliate-Program.svg"
                  alt=""
                  width={520}
                  height={520}
                  className="h-full w-full object-contain opacity-[0.9] dark:invert dark:opacity-95"
                  priority={false}
                />
              </div>
            </Card>
          </div>

          {/* Feature: PR Reviews — spans 4 cols */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4">
            <Card className="group h-full transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <GitPullRequest className="size-5" />
                </div>
                <CardTitle className="text-lg">PR reviews</CardTitle>
                <CardDescription>
                  AI reviews every open PR, checks security, docs, and CI—posts
                  feedback on GitHub.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Feature: Dashboard — spans 4 cols */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4">
            <Card className="group h-full transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <LayoutDashboard className="size-5" />
                </div>
                <CardTitle className="text-lg">Smart dashboard</CardTitle>
                <CardDescription>
                  Stats, contributors, commit activity. Customize theme, layout,
                  and accent colors.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Feature: Issues & AI — spans 4 cols */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4">
            <Card className="group h-full transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  <MessageSquare className="size-5" />
                </div>
                <CardTitle className="text-lg">Issues & repos</CardTitle>
                <CardDescription>
                  List, create, close issues. Create repos, merge PRs—all via AI
                  chat.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
