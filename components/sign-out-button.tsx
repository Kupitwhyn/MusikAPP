"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut()
        router.push("/")
        router.refresh()
      }}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
