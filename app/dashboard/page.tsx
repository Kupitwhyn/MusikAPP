import Link from "next/link"
import { getMyProjects } from "@/app/actions/projects"
import { getMyStats, getMyWorks } from "@/app/actions/works"
import { requireRole } from "@/lib/session"
import { SignOutButton } from "@/components/sign-out-button"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [stats, works, projects] = await Promise.all([getMyStats(), getMyWorks(), getMyProjects()])

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">
              Reverb
            </Link>
          </div>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/projects" className="hover:text-foreground">Projects</Link>
            <Link href="/works/new" className="hover:text-foreground">Add Work</Link>
            <Link href="/profile" className="hover:text-foreground">Profile</Link>
            <Link href="/discover" className="hover:text-foreground">Discover</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Musician archive
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Welcome back, {user.name}</h1>
          </div>
          <Link
            href="/works/new"
            className="rounded-md border border-border bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            New work
          </Link>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total works" value={String(stats.totalWorks)} />
          <StatCard label="Total projects" value={String(stats.totalProjects)} />
          <StatCard label="Role" value={user.role} />
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold">Recent works</h2>
                <Link href="/works" className="text-sm text-muted-foreground hover:text-foreground">
                  View all
              </Link>
            </div>

            {works.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
                No works yet. Add your first finished music work to begin the archive.
              </div>
            ) : (
              <div className="space-y-3">
                {works.slice(0, 6).map((work) => (
                  <Link href={`/works/${work.id}`} key={work.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:border-foreground/30">
                    <div>
                      <p className="font-medium">{work.title}</p>
                      <p className="text-sm text-muted-foreground">{work.artist}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{work.genreName ?? "Unassigned"}</p>
                      <p>{work.releasedDate ? new Date(work.releasedDate).toLocaleDateString() : "No date"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-semibold">Projects</h2>
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
                Manage
              </Link>
            </div>

            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              <ul className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="block rounded-lg border border-border p-3 transition-colors hover:border-foreground/30"
                    >
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">{project.workCount} works</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-serif text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}
