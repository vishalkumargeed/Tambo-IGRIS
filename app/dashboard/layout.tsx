import { RepoProvider } from "@/contexts/repo-context"
import { ThemeProvider } from "@/components/theme-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { MessageThreadSidebar } from "@/components/message-thread-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { auth } from "@/auth"
import { TamboProviderWithUser } from "@/components/tambo/tambo-provider-with-user"



export default async  function Layout({ children }: { children: React.ReactNode }) {

  
  const session = await auth()

  const rawToken = session?.accessToken
  const userToken =
    rawToken && typeof rawToken === "string" && rawToken.includes(".") && rawToken.split(".").length >= 2
      ? rawToken
      : undefined

  return (
    <TamboProviderWithUser
    apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
    userToken={userToken}
    user={session?.user ?? undefined}
  >


    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RepoProvider>
      <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
      <MessageThreadSidebar />
    </SidebarProvider>

   
      </RepoProvider>
    </ThemeProvider>
    </TamboProviderWithUser>
  )
}
