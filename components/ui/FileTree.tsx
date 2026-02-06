"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react"

export type FileTreeItem =
  | { name: string; path?: string }
  | { name: string; items: FileTreeItem[] }

type FileTreeProps = {
  items: FileTreeItem[]
  onSelectFile?: (path: string) => void
  selectedPath?: string | null
  /** Optional: show +x / -y for files that have stats */
  fileStats?: Record<string, { additions: number; deletions: number }>
}

export function FileTree({
  items,
  onSelectFile,
  selectedPath,
  fileStats,
}: FileTreeProps) {
  const renderItem = (fileItem: FileTreeItem) => {
    if ("items" in fileItem) {
      return (
        <Collapsible key={fileItem.name}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="group hover:bg-accent hover:text-accent-foreground w-full justify-start transition-none"
            >
              <ChevronRightIcon className="transition-transform group-data-[state=open]:rotate-90" />
              <FolderIcon />
              {fileItem.name}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="style-lyra:ml-4 mt-1 ml-5">
            <div className="flex flex-col gap-1">
              {fileItem.items.map((child) => renderItem(child))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }
    const path = "path" in fileItem ? fileItem.path : undefined
    const stats = path && fileStats?.[path]
    const isSelected = path != null && selectedPath === path
    return (
      <Button
        key={path ?? fileItem.name}
        variant="link"
        size="sm"
        className={`text-foreground w-full justify-start gap-2 ${isSelected ? "bg-accent text-accent-foreground" : ""}`}
        onClick={() => path && onSelectFile?.(path)}
      >
        <FileIcon />
        <span className="min-w-0 truncate">{fileItem.name}</span>
        {stats != null && typeof stats === "object" && "additions" in stats && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            +{stats.additions}/−{stats.deletions}
          </span>
        )}
      </Button>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-[16rem] gap-2">
      <CardHeader>
        <Tabs defaultValue="explorer">
          <TabsList className="w-full">
            <TabsTrigger value="explorer">Files</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="flex max-h-[min(60vh,24rem)] flex-col gap-1 overflow-y-auto">
          {items.map((item) => renderItem(item))}
        </div>
      </CardContent>
    </Card>
  )
}

type TreeNode = {
  name: string
  path?: string
  children?: Map<string, TreeNode>
}

/** Build a nested FileTreeItem[] from flat file paths (e.g. from PR files) */
export function buildFileTree(filenames: string[]): FileTreeItem[] {
  const rootMap = new Map<string, TreeNode>()

  for (const fullPath of filenames) {
    const parts = fullPath.split("/")
    let currentLevel = rootMap
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      if (isLast) {
        currentLevel.set(part, { name: part, path: fullPath })
        break
      }
      let node = currentLevel.get(part)
      if (!node) {
        node = { name: part, children: new Map() }
        currentLevel.set(part, node)
      }
      if (!node.children) node.children = new Map()
      currentLevel = node.children
    }
  }

  function nodeToItem(node: TreeNode): FileTreeItem {
    if (node.path != null) return { name: node.name, path: node.path }
    const items = node.children
      ? Array.from(node.children.values())
          .sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
          )
          .map(nodeToItem)
      : []
    return { name: node.name, items }
  }

  return Array.from(rootMap.values())
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    )
    .map(nodeToItem)
}
