import Image from "next/image"
import SignIn from "./components/authentication/Signin"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-16 bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="flex flex-shrink-0 flex-col items-center">
        <Image
          src="/logo.png"
          alt="Tambo Sentinel"
          width={260}
          height={53}
          className="rounded-4xl shadow-md shadow-gray-300"
          priority
        />
      </div>
      <div className="flex flex-col items-start gap-6">
        <div className="flex flex-col items-start gap-4 text-left">
          <p className="max-w-sm font-sans text-sm text-zinc-500 dark:text-zinc-400">
            Your GitHub repos and pull requests, in one place. Sign in to get started.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900 w-full max-w-sm">
          <SignIn />
        </div>
      </div>
    </div>
  )
}
