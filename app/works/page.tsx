import Link from "next/link"
import { getMyWorks } from "@/app/actions/works"
import { requireRole } from "@/lib/session"

export default async function WorksPage() {
  await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const works = await getMyWorks()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/works/new" className="hover:text-foreground">Add Work</Link>
            <Link href="/profile" className="hover:text-foreground">Profile</Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">my archive</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold">Works</h1>
          </div>
          <Link href="/works/new" className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">New work</Link>
        </div>
        {works.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-sm text-muted-foreground">No works in your archive yet.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {works.map((item) => (
              <Link key={item.id} href={`/works/${item.id}`} className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.artworkUrl && <img src={item.artworkUrl} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-serif text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.artist}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{item.genreName ?? "Unassigned"}{item.projectTitle ? ` · ${item.projectTitle}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
