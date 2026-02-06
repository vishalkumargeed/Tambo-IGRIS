import RepoList from "@/app/components/authentication/RepoList"

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1)
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <RepoList currentPage={currentPage} />
    </div>
  )
}