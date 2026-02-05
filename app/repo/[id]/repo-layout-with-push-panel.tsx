"use client";

import { MessageThreadCollapsible } from "@/components/tambo/message-thread-collapsible";
import * as React from "react";

const PANEL_WIDTH = 420;
const SIDEBAR_GAP = 24; // margin between main content and sidebar (gap-6)

export function RepoLayoutWithPushPanel({ children }: { children: React.ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "i") {
        e.preventDefault();
        setIsPanelOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isPanelOpen) {
        e.preventDefault();
        setIsPanelOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPanelOpen]);

  return (
    <div className="flex flex-1 min-h-0 w-full">
      {/* Main content - when panel open, margin-right so content doesn't go under fixed sidebar */}
      <div
        className="min-w-0 flex-1 transition-[margin] duration-300 ease-in-out overflow-auto"
        style={isPanelOpen ? { marginRight: PANEL_WIDTH + SIDEBAR_GAP } : undefined}
      >
        {children}
      </div>

      {/* Sidebar panel - fixed so it stays visible when page scrolls */}
      {isPanelOpen && (
        <aside
          className="fixed right-6 top-14 bottom-6 z-40 w-[420px] border border-border rounded-lg bg-background flex flex-col shadow-lg"
          style={{ width: PANEL_WIDTH }}
        >
          <MessageThreadCollapsible
            layoutMode="pushSidebar"
            open={true}
            onOpenChange={(open) => !open && setIsPanelOpen(false)}
            className="h-full min-h-0 rounded-none border-0 shadow-none flex flex-col"
            height="100%"
          />
        </aside>
      )}

      {/* Same compact bar as before: fixed at bottom center when panel closed; opens sidebar on submit or Ctrl+I */}
      {!isPanelOpen && (
        <MessageThreadCollapsible
          layoutMode="floatingBar"
          open={false}
          onOpenChange={(open) => open && setIsPanelOpen(true)}
          className="z-50"
        />
      )}
    </div>
  );
}
