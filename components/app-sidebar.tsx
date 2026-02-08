"use client"

import * as React from "react"
import {
  IssueOpenedIcon,
  GitPullRequestIcon,
  CodeIcon,
  MarkGithubIcon,
} from "@primer/octicons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

import { useSession } from "next-auth/react"
import { ModeToggle } from "./mode-toggle"

const data = {

 
  navMain: [
    {
      title: "Issues",
      url: "/dashboard/issues",
      icon: IssueOpenedIcon,
    },
    {
      title: "Pull Requests",
      url: "/dashboard/pull-requests",
      icon: GitPullRequestIcon,
    },
    {
      title: "Codebase",
      url: "/dashboard/code",
      icon: CodeIcon,
    },
  ],
 
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const user = session?.user
  const isMac =
    typeof navigator !== "undefined" && navigator.platform.startsWith("Mac")

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex w-full items-center gap-2">
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5 flex-1 min-w-0"
              >
                <a href="/dashboard">
                  <MarkGithubIcon size={20} className="shrink-0" />
                  <span className="truncate text-base font-semibold"> Sentinel</span>
                </a>
              </SidebarMenuButton>
              <div className="group-data-[collapsible=icon]:hidden shrink-0">
                <ModeToggle />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Sentinel Shortcuts</SidebarGroupLabel>
          <SidebarSeparator className="my-1" />
          <SidebarGroupContent className="flex flex-col gap-2 px-2 py-1">
            <div className="flex items-center justify-between gap-2 text-xs text-sidebar-foreground/80">
              <span>Open / close chat</span>
              <KbdGroup>
                {isMac ? (
                  <>
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </>
                ) : (
                  <>
                    <Kbd>Ctrl</Kbd>
                    <Kbd>K</Kbd>
                  </>
                )}
              </KbdGroup>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-sidebar-foreground/80">
              <span>Stop response</span>
              <KbdGroup>
                {isMac ? (
                  <>
                    <Kbd>⌘</Kbd>
                    <Kbd>C</Kbd>
                  </>
                ) : (
                  <>
                    <Kbd>Ctrl</Kbd>
                    <Kbd>C</Kbd>
                  </>
                )}
              </KbdGroup>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-sidebar-foreground/80">
              <span>Close chat</span>
              <Kbd>Esc</Kbd>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-sidebar-foreground/80">
              <span>Mention a repo</span>
              <Kbd>@</Kbd>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavUser user={user ?? undefined} />
      </SidebarFooter>
    </Sidebar>
  )
}
