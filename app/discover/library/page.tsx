import Link from "next/link"
import { getMyFavorites } from "@/app/actions/favorites"
import { requireRole } from "@/lib/session"

export default async function LibraryPage() {
  await requireRole(["AUDIENCE"])
  const works = await getMyFavorites()
  return <main className="min-h-svh bg-background text-foreground"><header className="border-b border-border"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><Link href="/discover" className="font-serif text-2xl font-semibold">Reverb</Link><Link href="/discover" className="text-sm text-muted-foreground">Discover</Link></div></header><div className="mx-auto max-w-6xl px-6 py-10"><h1 className="font-serif text-4xl font-semibold">Your library</h1>{works.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">No favorites yet.</p> : <div className="mt-8 grid gap-4 md:grid-cols-2">{works.map((work) => <Link key={work.id} href={`/discover/works/${work.id}`} className="rounded-xl border border-border bg-card p-4 hover:border-foreground/30"><p className="font-serif text-xl font-semibold">{work.title}</p><p className="text-sm text-muted-foreground">{work.artist}</p></Link>)}</div>}</div></main>
}
