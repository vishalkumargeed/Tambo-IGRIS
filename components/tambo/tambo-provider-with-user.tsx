"use client";

import { TamboProvider } from "@tambo-ai/react";
import type { ReactNode } from "react";

export interface TamboUserProfile {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface TamboProviderWithUserProps {
  children: ReactNode;
  apiKey: string;
  userToken?: string | undefined;
  user?: TamboUserProfile | null;
}


export function TamboProviderWithUser({
  children,
  apiKey,
  userToken,
  user,
}: TamboProviderWithUserProps) {
  const contextHelpers = {
    current_user: () =>
      user
        ? {
            name: user.name ?? undefined,
            email: user.email ?? undefined,
            image: user.image ?? undefined,
          }
        : null,
  };

  return (
    <TamboProvider
      apiKey={apiKey}
      userToken={userToken}
      contextHelpers={contextHelpers}
    >
      {children}
    </TamboProvider>
  );
}
