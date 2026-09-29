import Link from "next/link"
import { getGenres } from "@/app/actions/discover"
import { getMyProjectsSimple } from "@/app/actions/projects"
import { requireRole } from "@/lib/session"
import { WorkForm } from "./work-form"

export default async function NewWorkPage() {
  await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [genres, projects] = await Promise.all([getGenres(), getMyProjectsSimple()])

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/projects" className="hover:text-foreground">Projects</Link>
            <Link href="/profile" className="hover:text-foreground">Profile</Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <section className="rounded-xl border border-border bg-card p-6">
          <h1 className="font-serif text-3xl font-semibold">Create a new work</h1>
          <p className="mt-2 text-sm text-muted-foreground">Upload the finished audio and artwork, then add the archival metadata.</p>
          <WorkForm genres={genres} projects={projects} />
        </section>
      </div>
    </main>
  )
}
