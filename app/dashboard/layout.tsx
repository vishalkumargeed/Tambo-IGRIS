import { Suspense } from "react"
import Signout from "@/app/components/authentication/Signout"
import { RepoNav } from "@/app/components/RepoNav"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"

export default function Layout({ children }: { children: React.ReactNode }) {
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
          <RepoNav repoContext={false} />
        </Suspense>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </ThemeProvider>
  )
}
