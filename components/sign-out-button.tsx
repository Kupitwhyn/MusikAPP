"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

export function SignOutButton({ className, ariaLabel }: { className?: string; ariaLabel?: string } = {}) {
  const router = useRouter()
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={async () => {
        await authClient.signOut()
        router.push("/")
        router.refresh()
      }}
      className={className ?? "text-sm text-muted-foreground transition-colors hover:text-foreground"}
    >
      Sign out
    </button>
  )
}

export function SignOutMenuItem() {
  const router = useRouter()
  return (
    <DropdownMenuItem
      onSelect={async (e) => {
        e.preventDefault()
        await authClient.signOut()
        router.push("/")
        router.refresh()
      }}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </DropdownMenuItem>
  )
}
