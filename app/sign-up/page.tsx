import { redirect } from "next/navigation"
import Link from "next/link"
import { getSessionUser, homePathForRole } from "@/lib/session"
import { AuthForm } from "@/components/auth-form"

export default async function SignUpPage() {
  const user = await getSessionUser()
  if (user) redirect(homePathForRole(user.role))

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold tracking-tight">Reverb</span>
        </Link>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Join the archive</h1>
        <p className="mb-8 mt-2 text-sm text-muted-foreground">
          Create an account to publish your work or start a collection.
        </p>
        <AuthForm mode="sign-up" />
      </div>
    </main>
  )
}
