import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getGenres } from "@/app/actions/discover"
import { getMyProjectsSimple } from "@/app/actions/projects"
import { getMyWork, updateWork } from "@/app/actions/works"
import { requireRole } from "@/lib/session"

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { id } = await params
  const workId = Number(id)
  if (!Number.isInteger(workId)) notFound()
  const result = await getMyWork(workId)
  if (!result) notFound()
  const item = result.work
  const [genres, projects] = await Promise.all([getGenres(), getMyProjectsSimple()])

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
          <Link href={`/works/${workId}`} className="text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <section className="rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">edit archive</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">Edit {item.title}</h1>
          <form action={async (formData) => {
            "use server"
            await updateWork(workId, {
              title: String(formData.get("title") ?? ""),
              artist: String(formData.get("artist") ?? ""),
              genreId: Number(formData.get("genreId") ?? "") || null,
              projectId: Number(formData.get("projectId") ?? "") || null,
              createdDate: String(formData.get("createdDate") ?? "") || null,
              releasedDate: String(formData.get("releasedDate") ?? "") || null,
              duration: item.duration,
              composer: String(formData.get("composer") ?? "") || null,
              lyricist: String(formData.get("lyricist") ?? "") || null,
              producer: String(formData.get("producer") ?? "") || null,
              recording: String(formData.get("recording") ?? "") || null,
              version: String(formData.get("version") ?? "") || null,
              audioUrl: item.audioUrl,
              artworkUrl: item.artworkUrl,
              lyrics: String(formData.get("lyrics") ?? "") || null,
              fileSize: item.fileSize,
              format: item.format,
            })
            redirect(`/works/${workId}`)
          }} className="mt-6 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Title" name="title" defaultValue={item.title} required />
              <Field label="Artist" name="artist" defaultValue={item.artist} required />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <SelectField label="Genre" name="genreId" value={item.genreId} options={genres.map((genre) => ({ value: genre.id, label: genre.name }))} required />
              <SelectField label="Project" name="projectId" value={item.projectId} options={projects.map((project) => ({ value: project.id, label: project.title }))} emptyLabel="No project" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Created date" name="createdDate" type="date" defaultValue={item.createdDate ?? ""} required />
              <Field label="Released date" name="releasedDate" type="date" defaultValue={item.releasedDate ?? ""} required />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Composer" name="composer" defaultValue={item.composer ?? ""} />
              <Field label="Lyricist" name="lyricist" defaultValue={item.lyricist ?? ""} />
              <Field label="Producer" name="producer" defaultValue={item.producer ?? ""} />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <Field label="Recording" name="recording" defaultValue={item.recording ?? ""} />
              <Field label="Version" name="version" defaultValue={item.version ?? ""} />
            </div>
            <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
              Current audio: <a href={item.audioUrl} target="_blank" rel="noreferrer" className="text-foreground underline">{item.format ?? "audio file"}</a>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="lyrics">Lyrics</label>
              <textarea id="lyrics" name="lyrics" rows={6} defaultValue={item.lyrics ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">Save changes</button>
          </form>
        </section>
      </div>
    </main>
  )
}

function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue?: string | number; type?: string; required?: boolean }) {
  return <div><label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={defaultValue} required={required} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>
}

function SelectField({ label, name, value, options, emptyLabel = "Select genre", required }: { label: string; name: string; value: number | null; options: { value: number; label: string }[]; emptyLabel?: string; required?: boolean }) {
  return <div><label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label><select id={name} name={name} required={required} defaultValue={value ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="">{emptyLabel}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
}
