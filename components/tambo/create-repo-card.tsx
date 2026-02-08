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

export interface CreateRepoCardProps {
  /** Optional default org to create the repo under (e.g. when user said "create a repo in my org X") */
  organization?: string;
}

/**
 * Tambo component: rendered when the user asks to create a new GitHub repository.
 * Collects name, description, visibility, optional org, and init README.
 * On submit, sends the message to the thread so the AI can create the repo via GitHub MCP.
 */
export function CreateRepoCard({ organization }: CreateRepoCardProps) {
  const { setValue, submit } = useTamboThreadInput();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [visibility, setVisibility] = React.useState<"public" | "private">("public");
  const [org, setOrg] = React.useState(organization ?? "");
  const [initReadme, setInitReadme] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (organization?.trim()) setOrg(organization.trim());
  }, [organization]);

  const handleCreate = React.useCallback(() => {
    if (isSubmitting || !name.trim()) return;
    setIsSubmitting(true);
    const repoName = name.trim();
    const desc = description.trim();
    const underOrg = org.trim();
    const parts: string[] = [
      `Please create a new GitHub repository with name: ${repoName}`,
      `visibility: ${visibility}`,
    ];
    if (desc) parts.push(`description: ${desc}`);
    if (underOrg) parts.push(`under organization: ${underOrg}`);
    if (initReadme) parts.push("initialize with a README");
    const text = `${parts.join(", ")}. Use the GitHub MCP to create the repository.`;
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
  }, [name, description, visibility, org, initReadme, setValue, submit, isSubmitting]);

  return (
    <Card
      className={cn(
        "my-2 w-full max-w-md rounded-lg border border-border bg-card py-4 shadow-sm",
      )}
      data-slot="create-repo-card"
    >
      <CardHeader className="pb-2">
        <CardTitle id="create-repo-card-title" className="text-sm font-medium text-foreground">
          New repository
        </CardTitle>
        <CardDescription className="text-xs">
          Create a new GitHub repository. Repository name is required.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pb-2">
        <div className="space-y-2">
          <Label htmlFor="create-repo-name-input" className="text-xs">
            Repository name
          </Label>
          <Input
            id="create-repo-name-input"
            placeholder="my-new-repo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="focus-visible:border-muted-foreground/50 focus-visible:ring-muted-foreground/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-repo-desc-input" className="text-xs">
            Description (optional)
          </Label>
          <Input
            id="create-repo-desc-input"
            placeholder="Short description of the repository"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="focus-visible:border-muted-foreground/50 focus-visible:ring-muted-foreground/20"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Visibility</Label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="create-repo-visibility"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                disabled={isSubmitting}
                className="h-4 w-4 border-border"
              />
              Public
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="create-repo-visibility"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
                disabled={isSubmitting}
                className="h-4 w-4 border-border"
              />
              Private
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-repo-org-input" className="text-xs">
            Organization (optional)
          </Label>
          <Input
            id="create-repo-org-input"
            placeholder="Create under your user if left blank"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            disabled={isSubmitting}
            className="focus-visible:border-muted-foreground/50 focus-visible:ring-muted-foreground/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="create-repo-init-readme"
            checked={initReadme}
            onChange={(e) => setInitReadme(e.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-border"
          />
          <Label htmlFor="create-repo-init-readme" className="cursor-pointer text-xs">
            Initialize with a README
          </Label>
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
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Create repository"}
        </Button>
      </CardFooter>
    </Card>
  );
}
