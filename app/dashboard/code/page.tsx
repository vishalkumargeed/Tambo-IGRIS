"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRepo } from "@/contexts/repo-context"
import { IconBrandGithub } from "@tabler/icons-react"

const COMPLEXITIES = [
  "Large repositories can hit API rate and size limits.",
  "Some file types (such as binary files) aren't viewable.",
  "Navigation features like search, history, and blame are limited.",
  "GitHub is optimized for code browsing and provides the best experience.",
  "Use the button below to open this repository directly on GitHub.",
]

export default function DashboardCodePage() {
  const { repo } = useRepo()

  if (!repo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center text-sm">
          Select a repository from the header to view codebase options.
        </p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  const githubRepoUrl = `https://github.com/${repo.owner}/${repo.name}`

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Why we recommend viewing code on GitHub</CardTitle>
          <CardDescription>
            Browsing the codebase here has some limitations. For the best experience, open the repository on GitHub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            {COMPLEXITIES.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <IconBrandGithub className="size-4" />
              Open repository on GitHub
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
