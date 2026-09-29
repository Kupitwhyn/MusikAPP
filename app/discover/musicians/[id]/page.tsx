import Link from "next/link"
import { notFound } from "next/navigation"
import { getMusicianPublicProfile } from "@/app/actions/discover"

export default async function MusicianPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getMusicianPublicProfile(id)
  if (!result) notFound()
  const { profile, works } = result
  return <main className="min-h-svh bg-background text-foreground"><header className="border-b border-border"><div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5"><Link href="/discover" className="font-serif text-2xl font-semibold">Reverb</Link><Link href="/discover" className="text-sm text-muted-foreground">Discover</Link></div></header><div className="mx-auto max-w-5xl px-6 py-10"><section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">{profile.imageUrl ? <img src={profile.imageUrl ?? ""} alt={profile.displayName ?? "Musician"} className="h-24 w-24 rounded-full object-cover" /> : null}<div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">musician</p><h1 className="mt-2 font-serif text-4xl font-semibold">{profile.displayName}</h1><p className="mt-1 text-muted-foreground">{profile.primaryGenre || "Independent musician"}</p>{profile.bio && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}</div></section><h2 className="mt-10 font-serif text-2xl font-semibold">Published works</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{works.map((work) => <Link key={work.id} href={`/discover/works/${work.id}`} className="rounded-xl border border-border bg-card p-4 hover:border-foreground/30"><p className="font-serif text-xl font-semibold">{work.title}</p><p className="text-sm text-muted-foreground">{work.artist}</p></Link>)}</div></div></main>
}
