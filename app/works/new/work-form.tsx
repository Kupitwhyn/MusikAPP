"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createWork, type WorkInput } from "@/app/actions/works"
import { FileUploader } from "@/components/file-uploader"

type Option = { id: number; name: string }
type ProjectOption = { id: number; title: string }

export function WorkForm({ genres, projects }: { genres: Option[]; projects: ProjectOption[] }) {
  const router = useRouter()
  const [audio, setAudio] = useState<{ url: string; size: number; format: string } | null>(null)
  const [artwork, setArtwork] = useState<{ url: string; size: number; format: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(formData: FormData) {
    setSaving(true)
    setError(null)
    try {
      const input: WorkInput = {
        title: String(formData.get("title") ?? ""),
        artist: String(formData.get("artist") ?? ""),
        genreId: Number(formData.get("genreId") ?? "") || null,
        projectId: Number(formData.get("projectId") ?? "") || null,
        createdDate: String(formData.get("createdDate") ?? "") || null,
        releasedDate: String(formData.get("releasedDate") ?? "") || null,
        composer: String(formData.get("composer") ?? "") || null,
        lyricist: String(formData.get("lyricist") ?? "") || null,
        producer: String(formData.get("producer") ?? "") || null,
        recording: String(formData.get("recording") ?? "") || null,
        version: String(formData.get("version") ?? "") || null,
        duration: null,
        audioUrl: audio?.url ?? "",
        artworkUrl: artwork?.url ?? null,
        lyrics: String(formData.get("lyrics") ?? "") || null,
        fileSize: audio?.size ?? null,
        format: audio?.format ?? null,
      }
      await createWork(input)
      router.push("/dashboard")
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save work")
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void submit(new FormData(event.currentTarget))
      }}
      className="mt-6 space-y-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Title" name="title" required />
        <Field label="Artist" name="artist" required />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <SelectField label="Genre" name="genreId" options={genres.map((genre) => ({ value: genre.id, label: genre.name }))} emptyLabel="Select genre" required />
        <SelectField label="Project" name="projectId" options={projects.map((project) => ({ value: project.id, label: project.title }))} emptyLabel="No project" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Created date" name="createdDate" type="date" required />
        <Field label="Released date" name="releasedDate" type="date" required />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Composer" name="composer" />
        <Field label="Lyricist" name="lyricist" />
        <Field label="Producer" name="producer" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Recording" name="recording" />
        <Field label="Version" name="version" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Audio file</label>
          <FileUploader kind="audio" value={audio?.url} onUploaded={setAudio} onCleared={() => setAudio(null)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Artwork</label>
          <FileUploader kind="image" value={artwork?.url} onUploaded={setArtwork} onCleared={() => setArtwork(null)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Lyrics</label>
        <textarea name="lyrics" rows={5} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <button type="submit" disabled={saving || !audio} className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? "Saving..." : audio ? "Save and publish" : "Upload audio to continue"}
      </button>
    </form>
  )
}

function Field({ label, name, type = "text", required, min }: { label: string; name: string; type?: string; required?: boolean; min?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} min={min} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
    </div>
  )
}

function SelectField({ label, name, options, emptyLabel, required }: { label: string; name: string; options: { value: number; label: string }[]; emptyLabel: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label>
      <select id={name} name={name} required={required} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
        <option value="">{emptyLabel}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  )
}
