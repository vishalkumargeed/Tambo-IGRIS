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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
  const  {data : session} = useSession();
  const user= session?.user;

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
        <NavUser user={user ?? undefined} />
      </SidebarFooter>
    </Sidebar>
  )
}
