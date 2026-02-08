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
 * Shown when the agent has stopped mid-review (e.g. after one PR due to chain-of-thought termination).
 * Renders a Card with Continue and Cancel. Continue sends a message to resume the review flow;
 * Cancel just stops the response and dismisses the card (no message sent).
 */
export function ContinueReviewStrip() {
  const { isIdle, cancel } = useTamboThread();
  const { setValue, submit } = useTamboThreadInput();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [dismissedByCancel, setDismissedByCancel] = React.useState(false);

  // Show card again when thread goes busy (e.g. user sent something) so next time we're idle it can show
  React.useEffect(() => {
    if (!isIdle) setDismissedByCancel(false);
  }, [isIdle]);

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
    setDismissedByCancel(true);
    await cancel();
  }, [cancel]);

  if (!isIdle || dismissedByCancel) return null;

  return (
    <Card
      className={cn(
        "mx-4 mb-2 shrink-0 rounded-lg border border-border bg-card py-4 shadow-sm",
      )}
      data-slot="continue-review-strip"
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
