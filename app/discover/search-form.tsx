"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function SearchForm({ genres }: { genres: { id: number; name: string }[] }) {
  const router = useRouter()
  const params = useSearchParams()
  return (
    <form
      className="mt-6 flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const next = new URLSearchParams()
        const q = String(data.get("q") ?? "").trim()
        const genre = String(data.get("genre") ?? "")
        if (q) next.set("q", q)
        if (genre) next.set("genre", genre)
        router.push(`/discover${next.toString() ? `?${next}` : ""}`)
      }}
    >
      <input name="q" defaultValue={params.get("q") ?? ""} placeholder="Search title, artist, or musician" className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
      <select name="genre" defaultValue={params.get("genre") ?? ""} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
        <option value="">All genres</option>
        {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
      </select>
      <button type="submit" className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">Search</button>
    </form>
  )
}
