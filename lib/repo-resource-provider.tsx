"use client";

import type { ResourceProvider } from "@/components/tambo/message-input";
import type { ResourceItem } from "@/components/tambo/text-editor";
import { AtSign } from "lucide-react";
import * as React from "react";

type RepoFromApi = {
  id: number;
  name: string;
  full_name: string;
  owner: string;
};

/**
 * Hook that returns a ResourceProvider that fetches the user's GitHub repos
 * from /api/userRepos and filters them by the search query (name, full_name, owner).
 * Used for "@" mentions in the message input.
 */
export function useRepoResourceProvider(): ResourceProvider {
  return React.useMemo(
    (): ResourceProvider => ({
      async search(query: string): Promise<ResourceItem[]> {
        try {
          const res = await fetch("/api/userRepos");
          if (!res.ok) return [];
          const json = await res.json();
          if (!json.success || !Array.isArray(json.data)) return [];
          const repos = json.data as RepoFromApi[];
          const q = query.toLocaleLowerCase().trim();
          const filtered =
            q === ""
              ? repos
              : repos.filter(
                  (r) =>
                    r.name.toLocaleLowerCase().includes(q) ||
                    r.full_name.toLocaleLowerCase().includes(q) ||
                    (r.owner && r.owner.toLocaleLowerCase().includes(q)),
                );
          return filtered.map((r) => ({
            id: r.full_name,
            name: r.full_name,
            icon: React.createElement(AtSign, { className: "w-4 h-4" }),
          }));
        } catch {
          return [];
        }
      },
    }),
    [],
  );
}
