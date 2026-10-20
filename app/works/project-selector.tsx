"use client"

import Image from "next/image"
import { useState } from "react"

type ProjectOption = { id: number; title: string; artworkUrl: string | null }

export function ProjectSelector({
  projects,
  defaultValue = "",
  onProjectChange,
  standaloneArtworkUrl,
}: {
  projects: ProjectOption[]
  defaultValue?: string
  onProjectChange?: (projectId: number | null) => void
  standaloneArtworkUrl?: string | null
}) {
  const [selectedId, setSelectedId] = useState(defaultValue)
  const selectedProject = projects.find((item) => String(item.id) === selectedId)

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor="projectId">Project</label>
      <select
        id="projectId"
        name="projectId"
        value={selectedId}
        onChange={(event) => {
          const value = event.target.value
          setSelectedId(value)
          onProjectChange?.(Number(value) || null)
        }}
        className="w-full rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15"
      >
        <option value="">No project</option>
        {projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>

      {selectedProject ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#e9dac8] bg-[#fcf8f1] p-3" aria-live="polite">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f1e0cc] text-xs font-semibold text-[#80553b]">
            {selectedProject.artworkUrl ? (
              <Image src={selectedProject.artworkUrl} alt="" fill unoptimized sizes="48px" className="object-cover" />
            ) : "♪"}
          </div>
          <p className="text-xs leading-5 text-[#78685b]">
            {selectedProject.artworkUrl
              ? "This work will use the project artwork."
              : "This project has no artwork yet. Add a cover in project settings; otherwise any existing work artwork remains a fallback."}
          </p>
        </div>
      ) : standaloneArtworkUrl ? (
        <p className="mt-2 text-xs leading-5 text-[#78685b]" aria-live="polite">
          No project selected. This work uses its standalone artwork.
        </p>
      ) : (
        <p className="mt-2 text-xs leading-5 text-[#78685b]" aria-live="polite">
          No project selected. Upload artwork below to give this standalone work a cover.
        </p>
      )}
    </div>
  )
}
