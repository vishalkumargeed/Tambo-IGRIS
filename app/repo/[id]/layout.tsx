import { Suspense } from "react"
import Signout from "@/app/components/authentication/Signout"
import { RepoNav } from "@/app/components/RepoNav"

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id: owner } = await params
  return (
    <div className="min-h-screen flex flex-col font-heading tracking-tight">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
        <h1 className="text-lg font-semibold sm:text-xl">
          Tambo Sentinel
        </h1>
        <Signout />
      </header>
      <Suspense fallback={<div className="h-12 border-b border-border bg-muted/30" />}>
        <RepoNav owner={owner} repoContext />
      </Suspense>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  )
}
