"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTamboThread, useTamboThreadInput } from "@tambo-ai/react";
import * as React from "react";

const CONTINUE_MESSAGE =
  "Please continue reviewing the remaining PRs one by one using the GitHub MCP...";

/**
 * Tambo component: rendered by the LLM only when it has stopped after one PR
 * (chain-of-thought termination) and more PRs remain. Do not render for general
 * chat or when not in a multi-PR review flow. Shows Continue / Cancel card.
 */
export function ContinueReviewCard() {
  const { cancel } = useTamboThread();
  const { setValue, submit } = useTamboThreadInput();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const sendMessage = React.useCallback(
    (message: string) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setValue(message);
      const t = setTimeout(() => {
        submit({
          streamResponse: true,
          resourceNames: {},
        })
          .catch(() => {
            setIsSubmitting(false);
          })
          .then(() => {
            setIsSubmitting(false);
          });
      }, 80);
      return () => clearTimeout(t);
    },
    [setValue, submit, isSubmitting],
  );

  const handleContinue = React.useCallback(() => {
    sendMessage(CONTINUE_MESSAGE);
  }, [sendMessage]);

  const handleCancel = React.useCallback(async () => {
    await cancel();
  }, [cancel]);

  return (
    <Card
      className={cn(
        "my-2 w-full max-w-md rounded-lg border border-border bg-card py-4 shadow-sm",
      )}
      data-slot="continue-review-card"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          Review paused
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 text-muted-foreground text-xs">
        Continue reviewing remaining PRs or cancel to stop.
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting}
          className={cn(
            "rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium",
            "text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          Continue
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className={cn(
            "rounded-lg border border-destructive px-4 py-2 text-sm font-medium",
            "text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          Cancel
        </button>
      </CardFooter>
    </Card>
  );
}
