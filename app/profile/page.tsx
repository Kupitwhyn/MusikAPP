import Link from "next/link"
import { getMyProfile } from "@/app/actions/profile"
import { requireRole } from "@/lib/session"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { profile, account } = await getMyProfile()
  const initial = {
    displayName: profile?.displayName ?? account.name,
    bio: profile?.bio ?? null,
    primaryGenre: profile?.primaryGenre ?? null,
    imageUrl: profile?.imageUrl ?? account.image ?? null,
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Back to dashboard</Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <section className="rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">musician profile</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">Your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">This identity appears alongside your published archive.</p>
          <ProfileForm initial={initial} />
        </section>
      </div>
    </main>
  )
}
