import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getWorkDetail } from "@/app/actions/discover"
import { getMyFavoriteIds } from "@/app/actions/favorites"
import { getSessionUser } from "@/lib/session"
import { FavoriteButton } from "./favorite-button"
import { AudioPlayer } from "./audio-player"
import { ReportForm } from "./report-form"

export default async function PublicWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const workId = Number(id)
  if (!Number.isInteger(workId)) notFound()
  const [item, user] = await Promise.all([getWorkDetail(workId), getSessionUser()])
  if (!item) redirect("/discover")
  if (!user) redirect("/sign-in")
  const favoriteIds = user ? await getMyFavoriteIds().catch(() => []) : []

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/discover" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
          <Link href="/discover" className="text-sm text-muted-foreground hover:text-foreground">Back to discover</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[320px_1fr]">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            {item.artworkUrl ? <img src={item.artworkUrl} alt={item.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No artwork</div>}
          </div>
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">published work</p>
            <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight">{item.title}</h1>
            <Link href={`/discover/musicians/${item.musicianId}`} className="mt-2 inline-block text-lg text-muted-foreground hover:text-foreground">{item.artist}</Link>
            <AudioPlayer workId={item.id} audioUrl={item.audioUrl} />
            <div className="mt-5 flex flex-wrap gap-3">
              {user ? <FavoriteButton workId={item.id} initialFavorited={favoriteIds.includes(item.id)} /> : <Link href="/sign-in" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Sign in to favorite</Link>}
              <Link href={`/discover/musicians/${item.musicianId}`} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">View musician</Link>
              <ReportForm workId={item.id} />
            </div>
            <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
              <Meta label="Genre" value={item.genreName} /><Meta label="Project" value={null} />
              <Meta label="Released" value={item.releasedDate} /><Meta label="Version" value={item.version} />
              <Meta label="Composer" value={item.composer} /><Meta label="Lyricist" value={item.lyricist} />
              <Meta label="Producer" value={item.producer} /><Meta label="Recording" value={item.recording} />
            </div>
            {item.lyrics && <pre className="mt-8 whitespace-pre-wrap rounded-lg bg-muted/50 p-5 text-sm leading-relaxed">{item.lyrics}</pre>}
          </section>
        </div>
      </div>
    </main>
  )
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1">{value || "—"}</p></div>
}
