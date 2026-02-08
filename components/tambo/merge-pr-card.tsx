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

export interface MergePRCardProps {
  owner?: string;
  repo?: string;
  prNumber?: number;
  prTitle?: string;
}

/**
 * Tambo component: rendered when the user wants to merge a particular PR.
 * Shows a card with an input for the merge commit message. On submit, sends
 * the message to the thread so the AI can perform the merge via GitHub MCP.
 */
export function MergePRCard({
  owner = "",
  repo = "",
  prNumber = 0,
  prTitle,
}: MergePRCardProps) {
  const { setValue, submit } = useTamboThreadInput();
  const [commitMessage, setCommitMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleMerge = React.useCallback(() => {
    if (isSubmitting || !owner || !repo || !prNumber) return;
    setIsSubmitting(true);
    const message = commitMessage.trim();
    const text = message
      ? `Please merge PR #${prNumber} in ${owner}/${repo} with this commit message: ${message}`
      : `Please merge PR #${prNumber} in ${owner}/${repo}.`;
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
  }, [owner, repo, prNumber, commitMessage, setValue, submit, isSubmitting]);

  const displayTitle = prTitle
    ? `Merge PR #${prNumber}: ${prTitle}`
    : `Merge PR #${prNumber}`;

  return (
    <Card
      className={cn(
        "my-2 w-full max-w-md rounded-lg border border-border bg-card py-4 shadow-sm",
      )}
      data-slot="merge-pr-card"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {displayTitle}
        </CardTitle>
        <CardDescription className="text-xs">
          Enter an optional merge commit message. Leave blank to use the default.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <Label htmlFor="merge-pr-commit-message" className="text-xs">
            Commit message
          </Label>
          <Input
            id="merge-pr-commit-message"
            placeholder="Merge commit message (optional)"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            disabled={isSubmitting}
            className="focus-visible:border-muted-foreground/50 focus-visible:ring-muted-foreground/20"
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button
          type="button"
          size="sm"
          onClick={handleMerge}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Merging…" : "Merge"}
        </Button>
      </CardFooter>
    </Card>
  );
}
