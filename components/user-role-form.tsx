"use client"

import { useState, useTransition } from "react"
import { setUserRole } from "@/app/actions/admin"

const roles = ["SUPER_ADMIN", "MUSICIAN", "AUDIENCE"] as const
type Role = (typeof roles)[number]

export function UserRoleForm({ userId, initialRole }: { userId: string; initialRole: string }) {
  const [role, setRole] = useState<Role>(isRole(initialRole) ? initialRole : "AUDIENCE")
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function submit() {
    setMessage(null)
    startTransition(async () => {
      try {
        await setUserRole(userId, role)
        setMessage(`Role saved as ${role}. The user must sign in again.`)
      } catch (cause) {
        setMessage(cause instanceof Error ? cause.message : "Unable to update role")
      }
    })
  }

  return (
    <div>
      <select
        name="role"
        value={role}
        onChange={(event) => setRole(event.target.value as Role)}
        disabled={isPending}
        className="rounded border border-border bg-background px-2 py-1 text-xs"
      >
        {roles.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <button type="button" onClick={submit} disabled={isPending} className="ml-2 text-xs underline disabled:opacity-50">
        {isPending ? "Saving..." : "Save"}
      </button>
      {message ? <p role="status" className={`mt-1 text-xs ${message.includes("Unable") || message.includes("cannot") ? "text-destructive" : "text-muted-foreground"}`}>{message}</p> : null}
    </div>
  )
}

function isRole(value: string): value is Role {
  return roles.includes(value as Role)
}
