'use client'
import { Button } from "@/components/ui/button"
import { Video } from "lucide-react"

export default function Youtube() {
  const handleClick = () => {
    window.location.href = "https://youtu.be/MBC-_wCe5_Q";
  };

  return (
    <Button
      type="button"
      size="lg"
      variant="outline"
      className="font-heading w-full border-zinc-300 bg-white tracking-tight hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 sm:w-auto sm:min-w-[200px] gap-2"
      onClick={handleClick}
    >
      <Video className="size-5" />
      Video
    </Button>
  )
}
