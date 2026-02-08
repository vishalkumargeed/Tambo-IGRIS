"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { MarkGithubIcon } from "@primer/octicons-react"

type GitHubUser = {
  login: string
  id: number
  avatar_url?: string
  html_url?: string
  name?: string | null
  company?: string | null
  blog?: string | null
  location?: string | null
  email?: string | null
  bio?: string | null
  public_repos?: number
  followers?: number
  following?: number
  created_at?: string
  type?: string
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

export default function DashboardAccountPage() {
  const { data: session, status } = useSession()
  const [user, setUser] = React.useState<GitHubUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false)
      return
    }
    if (status !== "authenticated") return

    fetch("/api/githubUser")
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: GitHubUser }) => {
        if (body.success && body.data) setUser(body.data)
        else setError("Failed to load profile")
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [status])

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {status === "unauthenticated" ? (
          <>
            <p className="text-muted-foreground text-center text-sm">
              Sign in to view your account.
            </p>
            <Button asChild variant="link" className="mt-2">
              <Link href="/">Go to home</Link>
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Spinner className="size-4" />
            <span>Loading…</span>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-muted-foreground text-sm">
        <Spinner className="size-4" />
        <span>Loading your GitHub profile…</span>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-destructive text-center text-sm">{error ?? "Profile not found"}</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  const initials = (user.name || user.login)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your GitHub profile connected to Sentinel
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <Avatar className="h-24 w-24 rounded-xl border-2 border-border">
              <AvatarImage src={user.avatar_url} alt={user.login} />
              <AvatarFallback className="rounded-xl text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-xl">{user.name || user.login}</CardTitle>
              <CardDescription className="font-mono text-base text-muted-foreground">
                @{user.login}
              </CardDescription>
              {user.bio && (
                <p className="text-muted-foreground pt-2 text-sm">{user.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-2 text-sm">
                {user.public_repos != null && (
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{user.public_repos}</strong> repos
                  </span>
                )}
                {user.followers != null && (
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{user.followers}</strong> followers
                  </span>
                )}
                {user.following != null && (
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{user.following}</strong> following
                  </span>
                )}
              </div>
              {user.html_url && (
                <Button asChild variant="outline" size="sm" className="mt-2 gap-2">
                  <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MarkGithubIcon size={18} />
                    View on GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
          <CardDescription>Profile information from GitHub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {user.company && (
              <div>
                <p className="text-muted-foreground text-xs font-medium">Company</p>
                <p className="text-sm">{user.company}</p>
              </div>
            )}
            {user.location && (
              <div>
                <p className="text-muted-foreground text-xs font-medium">Location</p>
                <p className="text-sm">{user.location}</p>
              </div>
            )}
            {(user.email || session?.user?.email) && (
              <div>
                <p className="text-muted-foreground text-xs font-medium">Email</p>
                <p className="text-sm">{(user.email || session?.user?.email) ?? "—"}</p>
              </div>
            )}
            {user.blog && (
              <div>
                <p className="text-muted-foreground text-xs font-medium">Website</p>
                <a
                  href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {user.blog}
                </a>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs font-medium">Account type</p>
              <p className="text-sm capitalize">{user.type ?? "User"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">Member since</p>
              <p className="text-sm">{formatDate(user.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
