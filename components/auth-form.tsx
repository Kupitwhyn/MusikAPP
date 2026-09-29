"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Loader2, Mic2, Headphones } from "lucide-react"

type Mode = "sign-in" | "sign-up"
type Role = "MUSICIAN" | "AUDIENCE"

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [role, setRole] = useState<Role>("MUSICIAN")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          // Persisted to the user row; drives post-login routing.
          role,
        } as Parameters<typeof authClient.signUp.email>[0])
        if (error) throw new Error(error.message ?? "Could not create account")
      } else {
        const { error } = await authClient.signIn.email({ email, password })
        if (error) throw new Error(error.message ?? "Invalid email or password")
      }
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete authentication")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {mode === "sign-up" && (
        <div className="flex flex-col gap-2">
          <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            I am a
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <RoleTile
              active={role === "MUSICIAN"}
              onClick={() => setRole("MUSICIAN")}
              icon={<Mic2 className="h-4 w-4" />}
              label="Musician"
              hint="Publish work"
            />
            <RoleTile
              active={role === "AUDIENCE"}
              onClick={() => setRole("AUDIENCE")}
              icon={<Headphones className="h-4 w-4" />}
              label="Listener"
              hint="Discover music"
            />
          </div>
        </div>
      )}

      {mode === "sign-up" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            autoComplete="name"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="mt-1">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "sign-up" ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/sign-up" className="font-medium text-foreground underline underline-offset-4">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  )
}

function RoleTile({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors",
        active
          ? "border-accent bg-accent/10 ring-1 ring-accent"
          : "border-border hover:border-foreground/30",
      )}
    >
      <span className={cn("flex items-center gap-2 font-medium", active && "text-accent-foreground")}>
        {icon}
        {label}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{hint}</span>
    </button>
  )
}
