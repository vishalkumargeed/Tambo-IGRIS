"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import GitHubMarkdown from "@/components/githubMarkdown"
import { cn } from "@/lib/utils"

export function PRDescription({ body }: { body: string }) {
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-2"
    >
        <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer group select-none mb-3">
                 <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                    Description
                 </h2>
                 <ChevronRight className={cn("h-5 w-5 text-neutral-500 transition-transform duration-200", isOpen && "rotate-90")} />
            </div>
        </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/30">
            <div className="whitespace-pre-wrap wrap-break-word font-sans text-sm text-neutral-800 dark:text-neutral-200">
                <GitHubMarkdown content={body} />
            </div>
          </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
