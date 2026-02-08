"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTamboThreadInput } from "@tambo-ai/react";
import * as React from "react";

export interface CreateIssueCardProps {
  owner?: string;
  repo?: string;
  /** Optional display name for the repo (e.g. "owner/repo") */
  repoFullName?: string;
}

/**
 * Tambo component: rendered when the user asks to create a new issue.
 * Shows a card with title and body inputs. On submit, sends the message to the
 * thread so the AI can create the issue via GitHub MCP.
 */
export function CreateIssueCard({
  owner = "",
  repo = "",
  repoFullName,
}: CreateIssueCardProps) {
  const { setValue, submit } = useTamboThreadInput();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const displayName = repoFullName?.trim() || (owner && repo ? `${owner}/${repo}` : "this repository");

  const handleCreate = React.useCallback(() => {
    if (isSubmitting || !title.trim() || !owner || !repo) return;
    setIsSubmitting(true);
    const bodyText = body.trim();
    const text = bodyText
      ? `Please create an issue in ${owner}/${repo} with title: ${title.trim()} and body: ${bodyText}. Use the GitHub MCP to create the issue.`
      : `Please create an issue in ${owner}/${repo} with title: ${title.trim()}. Use the GitHub MCP to create the issue.`;
    setValue(text);
    const t = setTimeout(() => {
      submit({
        streamResponse: true,
        resourceNames: {},
      })
        .catch(() => setIsSubmitting(false))
        .then(() => setIsSubmitting(false));
    }, 80);
    return () => clearTimeout(t);
  }, [owner, repo, title, body, setValue, submit, isSubmitting]);

  return (
    <Card
      className={cn(
        "my-2 w-full max-w-md rounded-lg border border-border bg-card py-4 shadow-sm",
      )}
      data-slot="create-issue-card"
    >
      <CardHeader className="pb-2">
        <CardTitle id="create-issue-card-title" className="text-sm font-medium text-foreground">
          New issue
        </CardTitle>
        <CardDescription className="text-xs">
          Create a new issue in {displayName}. Title is required.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-2">
        <div className="space-y-2">
          <Label htmlFor="create-issue-title-input" className="text-xs">
            Title
          </Label>
          <Input
            id="create-issue-title-input"
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="focus-visible:border-muted-foreground/50 focus-visible:ring-muted-foreground/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-issue-body-input" className="text-xs">
            Description (optional)
          </Label>
          <textarea
            id="create-issue-body-input"
            placeholder="Add a description…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSubmitting}
            rows={6}
            className="border-input bg-background placeholder:text-muted-foreground flex w-full min-w-0 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus:border-muted-foreground/50 focus:ring-2 focus:ring-muted-foreground/20 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSubmitting}
          className="opacity-70"
          aria-label="Cancel (do not create)"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCreate}
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Create issue"}
        </Button>
      </CardFooter>
    </Card>
  );
}
