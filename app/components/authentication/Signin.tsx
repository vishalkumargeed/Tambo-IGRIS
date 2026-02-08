import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github", { redirectTo: "/dashboard" })
      }}
    >
      <Button
        type="submit"
        size="lg"
        variant="outline"
        className="font-heading w-full border-zinc-300 bg-white tracking-tight hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto sm:min-w-[200px] gap-2"
      >
        <Github className="size-5" />
        Sign in with GitHub
      </Button>
    </form>
  )
} 