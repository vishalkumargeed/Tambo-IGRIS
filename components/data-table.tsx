"use client"

import * as React from "react"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useRepo } from "@/contexts/repo-context"

export type ContributorRow = {
  id: number
  login: string
  avatarUrl: string
  contributions: number
  type: string
  htmlUrl: string
}

const columns: ColumnDef<ContributorRow>[] = [
  {
    id: "rank",
    header: () => <div className="w-12 text-right">#</div>,
    cell: ({ row }) => (
      <div className="text-muted-foreground w-12 text-right text-sm">
        {row.index + 1}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "avatarUrl",
    header: "User",
    cell: ({ row }) => {
      const c = row.original
      return (
        <a
          href={c.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:underline"
        >
          <Avatar className="size-8">
            <AvatarImage src={c.avatarUrl} alt={c.login} />
            <AvatarFallback className="text-xs">
              {c.login.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{c.login}</span>
        </a>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "contributions",
    header: () => <div className="text-right">Contributions</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono tabular-nums">
        {row.original.contributions.toLocaleString()}
      </div>
    ),
    sortingFn: "basic",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground font-normal">
        {row.original.type}
      </Badge>
    ),
    enableSorting: false,
  },
]

export function DataTable() {
  const { repo } = useRepo()
  const [data, setData] = React.useState<ContributorRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "contributions", desc: true },
  ])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    if (!repo) {
      setData([])
      return
    }
    setLoading(true)
    fetch(
      `/api/repoContributors?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((body: { success?: boolean; data?: ContributorRow[] }) => {
        if (body.success && Array.isArray(body.data)) setData(body.data)
        else setData([])
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [repo?.owner, repo?.name])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.id),
  })

  return (
    <div className="flex w-full flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Top contributors</Label>
      </div>
      <div className="overflow-hidden rounded-lg border">
        {!repo ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
            Select a repository to see contributors
          </div>
        ) : loading ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
            Loading…
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No contributors found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t px-4 py-2">
              <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                {table.getFilteredRowModel().rows.length} contributor(s)
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit lg:ml-auto">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label htmlFor="rows-per-page" className="text-sm font-medium">
                    Rows per page
                  </Label>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={(value) => {
                      table.setPageSize(Number(value))
                    }}
                  >
                    <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                      <SelectValue
                        placeholder={table.getState().pagination.pageSize}
                      />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 20, 30, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount() || 1}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">First page</span>
                    <IconChevronsLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Previous</span>
                    <IconChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Next</span>
                    <IconChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden size-8 lg:flex"
                    onClick={() =>
                      table.setPageIndex(table.getPageCount() - 1)
                    }
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Last page</span>
                    <IconChevronsRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
