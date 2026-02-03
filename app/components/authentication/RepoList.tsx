import { auth } from "@/auth"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type GitHubRepo = {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  description: string | null
  stargazers_count: number
  language: string | null
  updated_at: string
  owner: { login: string }
}

async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const res = await fetch("https://api.github.com/user/repos?per_page=50&sort=updated", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error("Failed to fetch repos")
  return res.json()
}

export default async function RepoList() {
  const session = await auth()
  console.log ("session is :",session);
  if (!session?.user) return null

  const accessToken = session.accessToken
  if (!accessToken) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-medium">Repo access not available</p>
        <p className="mt-1 text-sm">Sign out and sign in again to grant repo access.</p>
      </div>
    )
  }

  let repos: GitHubRepo[]
  try {
    repos = await fetchUserRepos(accessToken)
    console.log ("repos are :",repos);
  } catch {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        <p className="font-medium">Failed to load repositories</p>
        <p className="mt-1 text-sm">Check your connection or try again later.</p>
      </div>
    )
  }

  const publicRepos = repos.filter((r) => !r.private)
  const privateRepos = repos.filter((r) => r.private)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 border-b border-neutral-200 pb-4 dark:border-neutral-700">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {session.user.name ?? "User"}
          </h2>
          {session.user.email && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {session.user.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Public repos
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {publicRepos.length}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Private repos
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {privateRepos.length}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Your repositories
        </h3>
        <Table>
         
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Repository</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Visibility</TableHead>
              <TableHead className="w-[100px]">Language</TableHead>
              <TableHead className="w-[80px] text-right">Stars</TableHead>
              <TableHead className="w-[110px]">Last Updated</TableHead>
              <TableHead className="w-[70px]">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {repos.map((repo) => (
              <TableRow key={repo.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/repo/${encodeURIComponent(repo.owner.login)}?repo=${encodeURIComponent(repo.name)}`}
                    className="text-blue-600 hover:underline dark:text-blue-400 break-all"
                  >
                    {repo.full_name}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {repo.description || "—"}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      repo.private
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                    }`}
                  >
                    {repo.private ? "Private" : "Public"}
                  </span>
                </TableCell>
                <TableCell>{repo.language || "—"}</TableCell>
                <TableCell className="text-right">{repo.stargazers_count}</TableCell>
                <TableCell>{new Date(repo.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link
                    href={`/repo/${encodeURIComponent(repo.owner.login)}?repo=${encodeURIComponent(repo.name)}`}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          
        </Table>
      </div>
    </div>
  )
}
