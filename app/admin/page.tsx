import Link from "next/link"
import { getAdminStats } from "@/app/actions/admin"
import { requireRole } from "@/lib/session"
import { SignOutButton } from "@/components/sign-out-button"

export default async function AdminPage() {
  const user = await requireRole(["SUPER_ADMIN"])
  const stats = await getAdminStats()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="font-serif text-2xl font-semibold tracking-tight">
              Reverb Admin
            </Link>
          </div>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/admin/users" className="hover:text-foreground">Users</Link>
            <Link href="/admin/works" className="hover:text-foreground">Works</Link>
            <Link href="/admin/genres" className="hover:text-foreground">Genres</Link>
            <Link href="/admin/reports" className="hover:text-foreground">Reports</Link>
            <SignOutButton />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">platform overview</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Welcome, {user.name}</h1>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard label="Total users" value={String(stats.totalUsers)} />
          <StatCard label="Total musicians" value={String(stats.totalMusicians)} />
          <StatCard label="Total audiences" value={String(stats.totalAudiences)} />
          <StatCard label="Total works" value={String(stats.totalWorks)} />
          <StatCard label="Total projects" value={String(stats.totalProjects)} />
          <StatCard label="Total genres" value={String(stats.totalGenres)} />
          <StatCard label="Total reports" value={String(stats.totalReports)} />
          <StatCard label="Open reports" value={String(stats.openReports)} />
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <QuickLink href="/admin/users" label="Users" />
          <QuickLink href="/admin/works" label="Works" />
          <QuickLink href="/admin/genres" label="Genres" />
          <QuickLink href="/admin/reports" label="Reports" />
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

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-5 text-lg font-medium transition-colors hover:border-foreground/30">
      {label}
    </Link>
  )
}
