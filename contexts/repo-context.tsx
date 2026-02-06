"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY = "tambo-selected-repo";

export type RepoInfo = { owner: string; name: string; fullName: string } | null;

const RepoContext = React.createContext<{
  repo: RepoInfo;
  setRepo: (repo: RepoInfo) => void;
}>({ repo: null, setRepo: () => {} });

function readFromStorage(): RepoInfo {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { owner?: string; name?: string; fullName?: string };
    if (
      typeof parsed?.owner === "string" &&
      typeof parsed?.name === "string" &&
      typeof parsed?.fullName === "string"
    ) {
      return {
        owner: parsed.owner,
        name: parsed.name,
        fullName: parsed.fullName,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function writeToStorage(repo: RepoInfo) {
  if (typeof window === "undefined") return;
  if (repo) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(repo));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function RepoProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [repo, setRepoState] = React.useState<RepoInfo>(null);

  // Restore from URL or localStorage on mount / when search params change
  React.useEffect(() => {
    const owner = searchParams.get("owner");
    const repoName = searchParams.get("repo");
    if (owner && repoName) {
      setRepoState({
        owner,
        name: repoName,
        fullName: `${owner}/${repoName}`,
      });
      writeToStorage({ owner, name: repoName, fullName: `${owner}/${repoName}` });
      return;
    }
    const stored = readFromStorage();
    if (stored) {
      setRepoState(stored);
      // Sync URL so reload keeps the repo
      const q = new URLSearchParams(searchParams.toString());
      q.set("owner", stored.owner);
      q.set("repo", stored.name);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  const setRepo = React.useCallback(
    (next: RepoInfo) => {
      setRepoState(next);
      writeToStorage(next);
      const q = new URLSearchParams(searchParams.toString());
      if (next) {
        q.set("owner", next.owner);
        q.set("repo", next.name);
      } else {
        q.delete("owner");
        q.delete("repo");
      }
      const queryString = q.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <RepoContext.Provider value={{ repo, setRepo }}>
      {children}
    </RepoContext.Provider>
  );
}

export function useRepo() {
  return React.useContext(RepoContext);
}
