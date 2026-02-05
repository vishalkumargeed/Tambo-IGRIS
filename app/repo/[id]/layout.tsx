import { Suspense } from "react"
import Signout from "@/app/components/authentication/Signout"
import { RepoNav } from "@/app/components/RepoNav"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import { auth } from "@/auth"
import { TamboProviderWithUser } from "@/components/tambo/tambo-provider-with-user"
import { RepoLayoutWithPushPanel } from "./repo-layout-with-push-panel"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id: owner } = await params

  const session = await auth()

  const rawToken = session?.accessToken
  const userToken =
    rawToken && typeof rawToken === "string" && rawToken.includes(".") && rawToken.split(".").length >= 2
      ? rawToken
      : undefined

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen flex flex-col font-heading tracking-tight">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
          <h1 className="text-lg font-semibold sm:text-xl">
            Tambo Sentinel
          </h1>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Signout />
          </div>
        </header>
        <Suspense fallback={<div className="h-12 border-b border-border bg-muted/30" />}>
          <RepoNav owner={owner} repoContext />
        </Suspense>
        <main className="flex-1 flex flex-col min-h-0 px-4 py-6 sm:px-6 sm:py-8">
          <TamboProviderWithUser
            apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
            userToken={userToken}
            user={session?.user ?? undefined}
          >
            <RepoLayoutWithPushPanel>{children}</RepoLayoutWithPushPanel>
          </TamboProviderWithUser>
        </main>
      </div>
    </ThemeProvider>
  )
}
