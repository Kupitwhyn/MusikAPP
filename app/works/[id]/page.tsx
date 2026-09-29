import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { deleteWork, getMyWork } from "@/app/actions/works"
import { requireRole } from "@/lib/session"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { id } = await params
  const workId = Number(id)
  if (!Number.isInteger(workId)) notFound()
  const result = await getMyWork(workId)
  if (!result) notFound()
  const item = result.work

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
          <Link href="/works" className="text-sm text-muted-foreground hover:text-foreground">Back to works</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
            {item.artworkUrl && <img src={item.artworkUrl} alt={item.title} className="h-full w-full object-cover" />}
          </div>
          <section>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">archived work</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold">{item.title}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{item.artist}</p>
            <audio controls src={item.audioUrl} className="mt-6 w-full" />
            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <Meta label="Genre" value={result.genreName} />
              <Meta label="Project" value={result.projectTitle} />
              <Meta label="Version" value={item.version} />
              <Meta label="Format" value={item.format} />
              <Meta label="Composer" value={item.composer} />
              <Meta label="Lyricist" value={item.lyricist} />
              <Meta label="Producer" value={item.producer} />
              <Meta label="Recording" value={item.recording} />
            </div>
            {item.lyrics && <pre className="mt-6 whitespace-pre-wrap rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">{item.lyrics}</pre>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/works/${item.id}/edit`} className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">Edit work</Link>
              <form action={async () => { "use server"; await deleteWork(item.id); redirect("/works") }}>
                <ConfirmSubmitButton message="Delete this work permanently? This action cannot be undone." className="rounded-md border border-destructive/50 px-4 py-2 text-sm text-destructive">Delete work</ConfirmSubmitButton>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function Meta({ label, value }: { label: string; value: string | number | null | undefined }) {
  return <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1">{value || "—"}</p></div>
}
