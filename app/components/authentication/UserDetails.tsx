import { auth } from "@/auth"
import Image from "next/image"
 
export default async function UserDetails() {
  const session = await auth()
 
  if (!session?.user) return null
 
  return (
    <div>
      <img src={session?.user?.image || ""} alt="User Avatar" width={32} height={32} />
      <h1>{session?.user?.name}</h1>
      <p>{session?.user?.email}</p>
      <p>{session?.user?.accessToken}</p>
      <p>{session?.user?.refreshToken}</p>
      <p>{session?.user?.expires}</p>
      <p>{session?.user?.expires_at}</p>
      <p>{session?.user?.expires_in}</p>
      <p>{session?.user?.expires_in}</p>
    </div>
  )
}