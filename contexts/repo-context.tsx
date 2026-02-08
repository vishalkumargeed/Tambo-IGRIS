"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY_BASE = "tambo-selected-repo";

function getStorageKey(userId: string | null | undefined): string {
  return userId ? `${STORAGE_KEY_BASE}-${userId}` : STORAGE_KEY_BASE;
}

export type RepoInfo = { owner: string; name: string; fullName: string } | null;

const RepoContext = React.createContext<{
  repo: RepoInfo;
  setRepo: (repo: RepoInfo) => void;
}>({ repo: null, setRepo: () => {} });

function readFromStorage(userId: string | null | undefined): RepoInfo {
  if (typeof window === "undefined") return null;
  try {
    const key = getStorageKey(userId);
    let raw = localStorage.getItem(key);
    // One-time migration: if user-scoped key is empty but legacy key has data, migrate it
    if (!raw && userId) {
      const legacy = localStorage.getItem(STORAGE_KEY_BASE);
      if (legacy) {
        localStorage.setItem(key, legacy);
        raw = legacy;
      }
    }
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

function writeToStorage(repo: RepoInfo, userId: string | null | undefined) {
  if (typeof window === "undefined") return;
  const key = getStorageKey(userId);
  if (repo) {
    localStorage.setItem(key, JSON.stringify(repo));
  } else {
    localStorage.removeItem(key);
  }
}

const defaultContextValue = { repo: null as RepoInfo, setRepo: (() => {}) as (repo: RepoInfo) => void };

function RepoProviderInner({ children, userId }: { children: React.ReactNode; userId?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize from localStorage on client so restored repo is visible immediately (no flash of "Select a repo")
  const [repo, setRepoState] = React.useState<RepoInfo>(() =>
    typeof window !== "undefined" ? readFromStorage(userId) : null
  );

  // Restore from URL or localStorage on mount / when search params or userId change
  React.useEffect(() => {
    const owner = searchParams.get("owner");
    const repoName = searchParams.get("repo");
    if (owner && repoName) {
      const fromUrl = { owner, name: repoName, fullName: `${owner}/${repoName}` };
      setRepoState(fromUrl);
      writeToStorage(fromUrl, userId);
      return;
    }
    const stored = readFromStorage(userId);
    if (stored) {
      setRepoState(stored);
      // Sync URL so the restored repo is reflected in the address bar and survives reload
      const q = new URLSearchParams(searchParams.toString());
      q.set("owner", stored.owner);
      q.set("repo", stored.name);
      router.replace(`${pathname}?${q.toString()}`, { scroll: false });
    } else {
      setRepoState(null);
    }
  }, [searchParams, pathname, router, userId]);

  const setRepo = React.useCallback(
    (next: RepoInfo) => {
      setRepoState(next);
      writeToStorage(next, userId);
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
    [pathname, router, searchParams, userId]
  );

  return (
    <RepoContext.Provider value={{ repo, setRepo }}>
      {children}
    </RepoContext.Provider>
  );
}

export function RepoProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  /** When set, selected repo is stored per-user so it persists across logout/login */
  userId?: string | null;
}) {
  return (
    <React.Suspense fallback={<RepoContext.Provider value={defaultContextValue}>{children}</RepoContext.Provider>}>
      <RepoProviderInner userId={userId}>{children}</RepoProviderInner>
    </React.Suspense>
  );
}

export function useRepo() {
  return React.useContext(RepoContext);
}
