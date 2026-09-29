import Link from "next/link"
import { getFeaturedWorks, getGenres, searchWorks } from "@/app/actions/discover"
import { getSessionUser } from "@/lib/session"
import { SignOutButton } from "@/components/sign-out-button"
import { SearchForm } from "./search-form"

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string; genre?: string }> }) {
  const user = await getSessionUser()
  const params = await searchParams
  const [genres, works] = await Promise.all([
    getGenres(),
    params.q || params.genre ? searchWorks(params.q ?? "", Number(params.genre) || undefined) : getFeaturedWorks(12),
  ])
  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><Link href="/" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link><nav className="flex items-center gap-3 text-sm text-muted-foreground"><Link href="/discover" className="hover:text-foreground">Discover</Link>{user ? <><Link href={user.role === "AUDIENCE" ? "/discover/library" : user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard"} className="hover:text-foreground">{user.role === "AUDIENCE" ? "My library" : user.role === "SUPER_ADMIN" ? "Admin dashboard" : "Dashboard"}</Link><SignOutButton /></> : <><Link href="/sign-in" className="hover:text-foreground">Sign in</Link><Link href="/sign-up" className="rounded-md bg-foreground px-3 py-2 text-background">Get started</Link></>}</nav></div></header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="rounded-2xl border border-border bg-card p-8"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">digital archive</p><h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight">Discover finished works</h1><p className="mt-3 text-muted-foreground">Browse, search, and listen to the archive.</p><SearchForm genres={genres} /></section>
        <section className="mt-10"><div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-2xl font-semibold">{params.q || params.genre ? "Search results" : "Recently added"}</h2><span className="text-sm text-muted-foreground">{works.length} works</span></div>{works.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">No published works match your search.</div> : <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">{works.map((work) => <Link key={work.id} href={user ? `/discover/works/${work.id}` : "/sign-in"} className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/30"><div className="aspect-square bg-muted">{work.artworkUrl ? <img src={work.artworkUrl} alt={work.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No artwork</div>}</div><div className="p-3"><p className="truncate font-medium">{work.title}</p><p className="truncate text-sm text-muted-foreground">{work.artist}</p><p className="mt-1 text-xs text-muted-foreground">{user ? "Open to listen" : "Sign in to listen"}</p></div></Link>)}</div>}</section>
      </div>
    </main>
  )
}
