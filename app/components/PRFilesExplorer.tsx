"use client"

import { FileTree, buildFileTree } from "@/components/ui/FileTree"
import { useState } from "react"

export type PRFileForExplorer = {
  filename: string
  status: string
  additions: number
  deletions: number
  patch?: string | null
}

export function PRFilesExplorer({ files }: { files: PRFileForExplorer[] }) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const treeItems = buildFileTree(files.map((f) => f.filename))
  const fileStats = Object.fromEntries(
    files.map((f) => [f.filename, { additions: f.additions, deletions: f.deletions }])
  )
  const filesByPath = Object.fromEntries(files.map((f) => [f.filename, f]))
  const selectedFile = selectedPath ? filesByPath[selectedPath] : null

  if (files.length === 0) {
    return (
      <p className="rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
        No files changed in this PR.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <FileTree
        items={treeItems}
        onSelectFile={setSelectedPath}
        selectedPath={selectedPath}
        fileStats={fileStats}
      />
      <div className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50/30 dark:border-neutral-700 dark:bg-neutral-900/30">
        {selectedFile ? (
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-2 dark:border-neutral-700">
              <span className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 break-all">
                {selectedFile.filename}
              </span>
              <span className="flex items-center gap-2 text-xs">
                <span className="rounded px-1.5 py-0.5 font-medium text-neutral-600 dark:text-neutral-400">
                  {selectedFile.status}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  +{selectedFile.additions}
                </span>
                <span className="text-red-600 dark:text-red-400">
                  −{selectedFile.deletions}
                </span>
              </span>
            </div>
            <div className="max-h-[min(70vh,28rem)] overflow-auto p-4">
              {selectedFile.patch != null && selectedFile.patch !== "" ? (
                <pre className="text-sm whitespace-pre-wrap break-words">
                  {selectedFile.patch.split("\n").map((line, i) => {
                    const isAdd = line.startsWith("+") && !line.startsWith("+++")
                    const isDel = line.startsWith("-") && !line.startsWith("---")
                    return (
                      <div
                        key={i}
                        className={`border-l-2 pl-2 whitespace-pre-wrap break-words ${
                          isAdd
                            ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
                            : isDel
                              ? "border-red-500 bg-red-50/50 text-red-900 dark:bg-red-950/30 dark:text-red-100"
                              : "border-transparent text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {line}
                      </div>
                    )
                  })}
                </pre>
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No diff content (binary or empty file).
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-48 items-center justify-center p-6 text-sm text-neutral-500 dark:text-neutral-400">
            Select a file to view its diff
          </div>
        )}
      </div>
    </div>
  )
}
