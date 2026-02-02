import { auth } from "@/auth"
import Image from "next/image"

export default async function UserDetails() {
  const session = await auth()

  if (!session?.user) return null

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt="User Avatar"
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <div>
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {session.user.name ?? "User"}
        </p>
        {session.user.email && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {session.user.email}
          </p>
        )}
      </div>
    </div>
  )
}