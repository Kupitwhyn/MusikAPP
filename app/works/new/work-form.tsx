"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createWork, type WorkInput } from "@/app/actions/works"
import { FileUploader } from "@/components/file-uploader"
import { ProjectSelector } from "../project-selector"

type Option = { id: number; name: string }
type ProjectOption = { id: number; title: string; artworkUrl: string | null }

export function WorkForm({ genres, projects }: { genres: Option[]; projects: ProjectOption[] }) {
  const router = useRouter()
  const [audio, setAudio] = useState<{ url: string; size: number; format: string } | null>(null)
  const [artwork, setArtwork] = useState<{ url: string; size: number; format: string } | null>(null)
  const [projectId, setProjectId] = useState<number | null>(null)
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
        projectId: projectId,
        createdDate: String(formData.get("createdDate") ?? "") || null,
        releasedDate: String(formData.get("releasedDate") ?? "") || null,
        composer: String(formData.get("composer") ?? "") || null,
        lyricist: String(formData.get("lyricist") ?? "") || null,
        producer: String(formData.get("producer") ?? "") || null,
        recording: String(formData.get("recording") ?? "") || null,
        version: String(formData.get("version") ?? "") || null,
        duration: null,
        audioUrl: audio?.url ?? "",
        artworkUrl: projectId === null ? artwork?.url ?? null : null,
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
      className="mt-6 space-y-6"
    >
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b664e]">Work information</p>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Title" name="title" required />
          <Field label="Artist" name="artist" required />
          <SelectField label="Genre" name="genreId" options={genres.map((genre) => ({ value: genre.id, label: genre.name }))} emptyLabel="Select genre" required />
          <ProjectSelector
            projects={projects}
            onProjectChange={(selectedProjectId) => {
              setProjectId(selectedProjectId)
              if (selectedProjectId !== null) setArtwork(null)
            }}
          />
          <Field label="Created date" name="createdDate" type="date" required />
          <Field label="Released date" name="releasedDate" type="date" required />
        </div>
      </div>
      <div className="border-t border-[#eee3d7] pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b664e]">Credits and recording</p>
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Composer" name="composer" />
          <Field label="Lyricist" name="lyricist" />
          <Field label="Producer" name="producer" />
          <Field label="Recording" name="recording" />
          <Field label="Version" name="version" />
        </div>
      </div>
      <div className="border-t border-[#eee3d7] pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b664e]">Audio and artwork</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#594638]">Audio file <span className="text-[#a24e35]">*</span></label>
            <FileUploader variant="archive" kind="audio" value={audio?.url} onUploaded={setAudio} onCleared={() => setAudio(null)} />
          </div>
          {projectId === null ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-[#594638]">Standalone artwork <span className="text-xs font-normal text-[#9b8978]">Optional</span></label>
              <FileUploader variant="archive" kind="image" value={artwork?.url} onUploaded={setArtwork} onCleared={() => setArtwork(null)} />
            </div>
          ) : (
            <div className="flex min-h-[110px] items-center rounded-2xl border border-[#e9dac8] bg-[#fcf8f1] p-4 text-sm leading-6 text-[#78685b]">
              Artwork is inherited from the selected project. No separate work artwork is needed.
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-[#eee3d7] pt-5">
        <label className="mb-2 block text-sm font-medium text-[#594638]" htmlFor="lyrics">Lyrics <span className="text-xs font-normal text-[#9b8978]">Optional</span></label>
        <textarea id="lyrics" name="lyrics" rows={4} placeholder="Paste or type your lyrics here..." className="w-full rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a49786] focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15" />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <div className="border-t border-[#eee3d7] pt-5">
        <button type="submit" disabled={saving || !audio} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#a24e35] px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#833d2a] disabled:cursor-not-allowed disabled:bg-[#c9b5a7] disabled:text-white">
          {saving ? "Saving..." : audio ? "Save and publish" : "Upload audio to continue"}
        </button>
      </div>
    </form>
  )
}

function Field({ label, name, type = "text", required, min }: { label: string; name: string; type?: string; required?: boolean; min?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor={name}>{label}{required ? <span className="ml-1 text-[#a24e35]">*</span> : null}</label>
      <input id={name} name={name} type={type} required={required} min={min} className="w-full rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15" />
    </div>
  )
}

function SelectField({ label, name, options, emptyLabel, required }: { label: string; name: string; options: { value: number; label: string }[]; emptyLabel: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor={name}>{label}{required ? <span className="ml-1 text-[#a24e35]">*</span> : null}</label>
      <select id={name} name={name} required={required} className="w-full rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15">
        <option value="">{emptyLabel}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  )
}
