import { RepoProvider } from "@/contexts/repo-context"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardCustomizationProvider } from "@/contexts/dashboard-customization-context"
import { DashboardThemeSync } from "@/components/dashboard-customization-sync"
import { DashboardSidebarWrapper } from "@/components/dashboard-sidebar-wrapper"
import { AppSidebar } from "@/components/app-sidebar"
import { MessageThreadSidebar } from "@/components/message-thread-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { auth } from "@/auth"
import { TamboProviderWithUser } from "@/components/tambo/tambo-provider-with-user"
import { getGitHubLogin } from "@/lib/github-user"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  const userToken =
    typeof session?.accessToken === "string" && session.accessToken.length > 0
      ? session.accessToken
      : undefined

  const owner = userToken ? await getGitHubLogin(userToken) : null
  // Use login (GitHub username) as primary - it's stable and always set for GitHub OAuth
  const userId =
    (session?.user as { login?: string | null } | undefined)?.login ??
    session?.user?.id ??
    session?.user?.email ??
    null

  return (
    <TamboProviderWithUser
      apiKey={process.env.TAMBO_API_KEY!}
      userToken={userToken}
      user={session?.user ?? undefined}
      owner={owner ?? undefined}
    >


    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DashboardCustomizationProvider userId={userId}>
        <DashboardThemeSync />
        <RepoProvider userId={userId}>
          <DashboardSidebarWrapper>
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              {children}
            </SidebarInset>
            <MessageThreadSidebar />
          </DashboardSidebarWrapper>
        </RepoProvider>
      </DashboardCustomizationProvider>
    </ThemeProvider>
    </TamboProviderWithUser>
  )
}
