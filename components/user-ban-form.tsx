"use client"

import { useState, useTransition } from "react"
import { setUserBanned } from "@/app/actions/admin"

export function UserBanForm({ userId, banned }: { userId: string; banned: boolean }) {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  function submit() {
    setMessage(null)
    startTransition(async () => {
      try {
        await setUserBanned(userId, !banned)
        setMessage(banned ? "User unsuspended successfully." : "User suspended successfully. Active sessions were revoked.")
      } catch (cause) {
        setMessage(cause instanceof Error ? cause.message : "Unable to update suspension status")
      }
    })
  }
  return <div><button type="button" disabled={isPending} onClick={() => { if (window.confirm(banned ? "Unsuspend this user?" : "Suspend this user from the platform?")) submit() }} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50">{isPending ? "Saving..." : banned ? "Unban" : "Suspend"}</button>{message ? <p role="status" className={`mt-1 text-xs ${message.includes("Unable") ? "text-destructive" : "text-muted-foreground"}`}>{message}</p> : null}</div>
}
