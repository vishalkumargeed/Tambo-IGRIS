"use client"

import * as React from "react"
import { Copy, MessageCircle } from "lucide-react"
import { BookIcon } from "@primer/octicons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/** Fired when Examples page wants to insert a prompt into the chat. Detail: { prompt: string } */
export const TAMBO_INSERT_PROMPT = "tambo-insert-prompt"

type ExampleCategory = "pr" | "issues" | "repo" | "dashboard" | "general"

const EXAMPLES: {
  id: string
  category: ExampleCategory
  categoryLabel: string
  title: string
  description: string
  prompt: string
  /** Bento grid: span 2 cols or 2 rows for emphasis */
  featured?: boolean
  /** Extra example prompts shown in the card (e.g. for "Customize the dashboard") */
  examplePrompts?: string[]
}[] = [
  {
    id: "review-all",
    category: "pr",
    categoryLabel: "Pull Requests",
    title: "Review all open PRs",
    description: "AI reviews every open PR in the repo using the full protocol and posts feedback on GitHub.",
    prompt: "Review all open PRs in this repository.",
    featured: true,
  },
  {
    id: "merge-pr",
    category: "pr",
    categoryLabel: "Pull Requests",
    title: "Merge a PR",
    description: "Merge a specific PR. You’ll get a card to enter an optional merge commit message.",
    prompt: "Merge PR #1",
    featured: true,
  },
  {
    id: "create-issue",
    category: "issues",
    categoryLabel: "Issues",
    title: "Create an issue",
    description: "Open a form to create a new issue with title and description in the current repo.",
    prompt: "I want to create an issue.",
    featured: true,
  },
  {
    id: "create-repo",
    category: "repo",
    categoryLabel: "Repository",
    title: "Create a repository",
    description: "Create a new GitHub repo. You can set name, description, visibility, and optional README.",
    prompt: "Create a new repository.",
    featured: true,
  },
  {
    id: "list-open-prs",
    category: "pr",
    categoryLabel: "Pull Requests",
    title: "List open PRs",
    description: "See an interactive table of open pull requests. You can then review, merge, or close selected ones.",
    prompt: "List open pull requests.",
  },
  {
    id: "list-closed-prs",
    category: "pr",
    categoryLabel: "Pull Requests",
    title: "List closed PRs",
    description: "View closed PRs and optionally reopen or review them.",
    prompt: "List closed pull requests.",
  },
  {
    id: "list-open-issues",
    category: "issues",
    categoryLabel: "Issues",
    title: "List open issues",
    description: "See all open issues in an interactive table. Close or manage them from the table.",
    prompt: "List open issues.",
  },
  {
    id: "list-closed-issues",
    category: "issues",
    categoryLabel: "Issues",
    title: "List closed issues",
    description: "View closed issues and reopen or manage them.",
    prompt: "List closed issues.",
  },
  {
    id: "customize-dashboard",
    category: "dashboard",
    categoryLabel: "Dashboard",
    title: "Customize the dashboard",
    description: "Change the dashboard to match your preference: theme (light/dark), card layout (grid/compact/minimal), sidebar width, accent color, and which sections to show. You can ask for stats as a radial chart, contributors as a table or bar chart, and more.",
    prompt: "Customize the dashboard: switch to dark theme and use compact card layout.",
    featured: true,
    examplePrompts: [
      "Show repo stats as a radial chart instead of cards.",
      "Show contributors in a bar chart with insights.",
      "Use dark theme and a wider sidebar.",
      "Use minimal card layout and hide the chart section.",
      "Show stats as cards again and contributors as a table.",
    ],
  },
  {
    id: "stats-radial-chart",
    category: "dashboard",
    categoryLabel: "Dashboard",
    title: "Show stats as radial chart",
    description: "Replace the 4 cards with a pie/radial chart (repo stats only; contributors section unchanged). All 4 labels (Merged PRs, Open PRs, Open Issues, Closed Issues) are clickable.",
    prompt: "Show the repo stats as a radial chart instead of cards.",
    featured: true,
  },
  {
    id: "stats-radial-graph",
    category: "dashboard",
    categoryLabel: "Dashboard",
    title: "Repo stats as radial graph",
    description: "Same as above: show only the repo stats (PR/Issue counts) as a radial graph. Do not change the contributors section.",
    prompt: "Show me the repo stats in the form of radial graph.",
  },
  {
    id: "stats-back-to-cards",
    category: "dashboard",
    categoryLabel: "Dashboard",
    title: "Show stats as cards",
    description: "Switch back from radial chart to the default 4-card layout for PR and issue counts.",
    prompt: "Show the stats as cards again.",
  },
  {
    id: "contributors-bar-chart",
    category: "dashboard",
    categoryLabel: "Dashboard",
    title: "Contributors as bar chart",
    description: "Show top contributors in an interactive bar chart with a dropdown to select 10, 50, or 200 contributors.",
    prompt: "Show contributors in an interactive bar chart.",
    featured: true,
  },
  {
    id: "contributors-detailed-view",
    category: "dashboard",
    categoryLabel: "Dashboard",
    title: "Detailed view of contributors",
    description: "Show the Contributor Insights card (type breakdown + top 5) and the contributors bar chart side by side.",
    prompt: "Show me the detailed view of the contributors.",
    featured: true,
  },
  {
    id: "contributors-bar-chart-alt",
    category: "dashboard",
    categoryLabel: "Dashboard",
    title: "Show contributors in bar chart",
    description: "Same as detailed view: Contributor Insights card and interactive bar chart.",
    prompt: "Show me the contributors in bar chart.",
  },
  {
    id: "contributors-back-to-table",
    category: "dashboard",
    categoryLabel: "Dashboard",
    title: "Contributors as table",
    description: "Show only the tabular view of contributors (no insights card or bar chart).",
    prompt: "Show me the contributors in the form of table.",
  },
  {
    id: "what-can-you-do",
    category: "general",
    categoryLabel: "General",
    title: "What can you do?",
    description: "Ask the AI about its capabilities for this project.",
    prompt: "What can you help me with?",
  },
  {
    id: "general-help",
    category: "general",
    categoryLabel: "General",
    title: "General assistant",
    description: "Use the AI for non-GitHub tasks: writing, coding help, or explanations.",
    prompt: "Help me write a short README for a Node.js project.",
  },
]

const categoryStyles: Record<ExampleCategory, string> = {
  pr: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  issues: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  repo: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30",
  dashboard: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
  general: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
}

function ExampleCard({
  example,
  onTryInChat,
  onCopy,
}: {
  example: (typeof EXAMPLES)[number]
  onTryInChat: (prompt: string) => void
  onCopy: (prompt: string) => void
}) {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = () => {
    onCopy(example.prompt)
    setCopied(true)
    const t = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(t)
  }

  return (
    <Card
      className={cn(
        "group flex h-full flex-col transition-shadow hover:shadow-md",
        example.featured && example.id !== "customize-dashboard" && "border-primary/30",
        example.featured && example.id !== "customize-dashboard" && "bg-primary/5",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", categoryStyles[example.category])}>
            {example.categoryLabel}
          </Badge>
        </div>
        <CardTitle className="text-base">{example.title}</CardTitle>
        <CardDescription className="text-sm">{example.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-0">
        <div className="rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
          &ldquo;{example.prompt}&rdquo;
        </div>
        {example.examplePrompts && example.examplePrompts.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">More examples you can try:</p>
            <ul className="flex flex-col gap-1.5">
              {example.examplePrompts.map((promptText, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate rounded border border-transparent bg-muted/30 px-2 py-1.5 font-mono text-[11px] text-muted-foreground">
                    &ldquo;{promptText}&rdquo;
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-xs"
                    onClick={() => onTryInChat(promptText)}
                  >
                    Try
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onTryInChat(example.prompt)} className="gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" />
            Try in chat
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardExamplesPage() {
  const { toggleRightSidebar } = useSidebar()

  const handleCopy = React.useCallback((prompt: string) => {
    void navigator.clipboard?.writeText(prompt)
  }, [])

  const handleTryInChat = React.useCallback(
    (prompt: string) => {
      toggleRightSidebar()
      requestAnimationFrame(() => {
        window.dispatchEvent(
          new CustomEvent(TAMBO_INSERT_PROMPT, { detail: { prompt } }),
        )
      })
    },
    [toggleRightSidebar],
  )

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BookIcon size={28} className="text-muted-foreground" />
          Examples
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Try these prompts with Sentinel. Click &ldquo;Try in chat&rdquo; to open the chat with the prompt, or copy and paste.
        </p>
      </div>

      {/* Bento grid */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        style={{
          gridAutoRows: "minmax(180px, auto)",
        }}
      >
        {EXAMPLES.map((example) => (
          <div
            key={example.id}
            className={cn(
              example.featured && "sm:col-span-2",
              example.id === "customize-dashboard" && "sm:row-span-2",
            )}
          >
            <ExampleCard
              example={example}
              onCopy={handleCopy}
              onTryInChat={handleTryInChat}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
