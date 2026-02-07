"use client";

import { TamboProvider } from "@tambo-ai/react";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { useEffect, useState, useMemo } from "react";
import { components } from "@/lib/tambo";

export interface TamboUserProfile {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  owner?: string | null;
}

export interface TamboProviderWithUserProps {
  children: ReactNode;
  apiKey: string;
  userToken?: string;
  user?: TamboUserProfile | null;
  owner?: string | null;
}

export function TamboProviderWithUser({
  children,
  apiKey,
  userToken,
  user,
  owner: ownerProp,
}: TamboProviderWithUserProps) {
  const [fetchedOwner, setFetchedOwner] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    // If owner is provided via props, or we lack auth, don't fetch
    if (ownerProp || !userToken || !session?.user) {
      setFetchedOwner(null);
      return;
    }

    let isMounted = true;

    async function fetchGitHubUser() {
      try {
        const response = await fetch("/api/github-user");
        
        if (!response.ok) throw new Error("Failed to fetch user");

        const data = await response.json();
        console.log("data ", data);
        
        if (isMounted && data?.login) {
          setFetchedOwner(data.login);
        }
      } catch (error) {
        console.error("Error fetching GitHub username:", error);
        if (isMounted) setFetchedOwner(null);
      }
    }

    fetchGitHubUser();

    return () => {
      isMounted = false;
    };
  }, [ownerProp, userToken, session?.user]);

  // Derived state: prioritize the prop over the fetched value
  const activeOwner = ownerProp ?? fetchedOwner;

  // Memoize contextHelpers to prevent unnecessary provider re-renders.
  // Use github_login (not name) for GitHub API/repo lookups: name is display name (e.g. "vishalk26x"),
  // while login is the actual username (e.g. "vishalk26-spec") required for owner/repo.
  const contextHelpers = useMemo(() => ({
    current_user: () => user ? {
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      image: user.image ?? undefined,
      /** GitHub API username (login). Use this for owner/repo, not name. */
      github_login: activeOwner ?? undefined,
      owner: activeOwner ?? undefined,
    } : null,
    /** Default GitHub owner for repo lookups. This is the login (e.g. vishalk26-spec), not display name. */
    owner: () => activeOwner,
  }), [user, activeOwner]);

  return (
    <TamboProvider
      apiKey={apiKey}
      userToken={userToken}
      contextHelpers={contextHelpers}
      components={components}
    >
      {children}
    </TamboProvider>
  );
}