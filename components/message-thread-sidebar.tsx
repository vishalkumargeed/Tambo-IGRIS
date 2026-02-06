"use client"

import { MessageThreadCollapsible } from "@/components/tambo/message-thread-collapsible"
import { Sidebar, SidebarContent } from "@/components/ui/sidebar"

/**
 * Right sidebar that contains the message thread, using the same layout
 * pattern as the left AppSidebar (reserves space, not overlay).
 */
export function MessageThreadSidebar() {
  return (
    <Sidebar
      side="right"
      sidebarId="right"
      collapsible="offcanvas"
      variant="inset"
      className="border-l"
    >
      <SidebarContent className="flex flex-col gap-0 p-0">
        <MessageThreadCollapsible
          embedded
          defaultOpen={true}
          className="h-full min-h-0 flex-1"
        />
      </SidebarContent>
    </Sidebar>
  )
}
