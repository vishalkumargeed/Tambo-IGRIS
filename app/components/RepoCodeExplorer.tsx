"use client"

import { FileTree, buildFileTree } from "@/components/ui/FileTree"
import { useEffect, useState } from "react"

type RepoCodeExplorerProps = {
  owner: string
  repoName: string
  filePaths: string[]
}

export function RepoCodeExplorer({
  owner,
  repoName,
  filePaths,
}: RepoCodeExplorerProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedPath) {
      setContent(null)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    fetch(
      `/api/repoFileContent?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}&path=${encodeURIComponent(selectedPath)}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (json?.success && json?.data?.content != null) setContent(json.data.content)
        else setError(json?.error ?? "Failed to load file")
      })
      .catch(() => setError("Failed to load file"))
      .finally(() => setLoading(false))
  }, [owner, repoName, selectedPath])

  const treeItems = buildFileTree(filePaths)

  if (filePaths.length === 0) {
    return (
      <p className="rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
        No files in this repository.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <FileTree
        items={treeItems}
        onSelectFile={setSelectedPath}
        selectedPath={selectedPath}
      />
      <div className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50/30 dark:border-neutral-700 dark:bg-neutral-900/30">
        {selectedPath ? (
          <div className="flex flex-col">
            <div className="border-b border-neutral-200 px-4 py-2 dark:border-neutral-700">
              <span className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 break-all">
                {selectedPath}
              </span>
            </div>
            <div className="max-h-[min(70vh,28rem)] overflow-auto p-4">
              {loading && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Loading…
                </p>
              )}
              {error && !loading && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              {content != null && !loading && (
                <pre className="whitespace-pre-wrap wrap-break-word font-mono text-sm text-neutral-800 dark:text-neutral-200">
                  {content}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-h-48 items-center justify-center p-6 text-sm text-neutral-500 dark:text-neutral-400">
            Select a file to view its content
          </div>
        )}
      </div>
    </div>
  )
}
