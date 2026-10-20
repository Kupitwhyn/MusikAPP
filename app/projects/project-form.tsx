"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProject, updateProject, type ProjectInput } from "@/app/actions/projects"
import { FileUploader } from "@/components/file-uploader"

type ProjectFormInitial = ProjectInput & { id: number }

export function ProjectForm({ initial }: { initial?: ProjectFormInitial }) {
  const router = useRouter()
  const [artworkUrl, setArtworkUrl] = useState(initial?.artworkUrl ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(formData: FormData) {
    setSaving(true)
    setError(null)
    const input: ProjectInput = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      createdDate: String(formData.get("createdDate") ?? "") || null,
      releaseDate: String(formData.get("releaseDate") ?? "") || null,
      artworkUrl,
    }

    try {
      if (initial) {
        await updateProject(initial.id, input)
        router.push(`/projects/${initial.id}`)
      } else {
        await createProject(input)
        router.push("/projects")
      }
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save project")
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void submit(new FormData(event.currentTarget))
      }}
      className="mt-6 space-y-4"
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor="project-title">Title</label>
        <input
          id="project-title"
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          placeholder="Project name..."
          className="w-full rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a49786] focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor="project-description">Description</label>
        <textarea
          id="project-description"
          name="description"
          rows={4}
          defaultValue={initial?.description ?? ""}
          placeholder="Tell us about your project..."
          className="w-full resize-y rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a49786] focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#594638]">
          Project artwork <span className="font-normal text-[#9b8978]">Optional</span>
        </label>
        <p className="mb-2 text-xs leading-5 text-[#78685b]">
          This cover is used by every work in the project. Works without a project can use their own artwork.
        </p>
        <FileUploader
          variant="archive"
          kind="image"
          label="Project artwork"
          value={artworkUrl}
          onUploaded={(result) => setArtworkUrl(result.url)}
          onCleared={() => setArtworkUrl(null)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor="project-created-date">Created date</label>
          <input
            id="project-created-date"
            type="date"
            name="createdDate"
            defaultValue={initial?.createdDate ?? ""}
            className="w-full min-w-0 rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3 py-3 text-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor="project-release-date">
            Release date <span className="font-normal text-[#9b8978]">Optional</span>
          </label>
          <input
            id="project-release-date"
            type="date"
            name="releaseDate"
            defaultValue={initial?.releaseDate ?? ""}
            className="w-full min-w-0 rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3 py-3 text-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15"
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#a24e35] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#833d2a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : initial ? "Save changes" : "Save project"}
      </button>
    </form>
  )
}
