
import { signIn } from "@/auth"
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github" , { redirectTo: "/dashboard" })
      }}
    >
      <button type="submit" className="font-heading tracking-tight w-full">Signin with GitHub</button>
    </form>
  )
} 