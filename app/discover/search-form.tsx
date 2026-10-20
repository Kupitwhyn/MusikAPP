"use client"

import { useRouter, useSearchParams } from "next/navigation"

export function SearchForm({ genres }: { genres: { id: number; name: string }[] }) {
  const router = useRouter()
  const params = useSearchParams()
  return (
    <form
      className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(180px,0.42fr)_auto]"
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
      <input name="q" defaultValue={params.get("q") ?? ""} placeholder="Search title, artist, or musician..." className="min-w-0 rounded-xl border border-[#dfd0bf] bg-[#fffdf8]/95 px-3.5 py-3 text-sm shadow-sm outline-none transition placeholder:text-[#a49786] focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15" />
      <select name="genre" defaultValue={params.get("genre") ?? ""} className="min-w-0 rounded-xl border border-[#dfd0bf] bg-[#fffdf8]/95 px-3.5 py-3 text-sm shadow-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15">
        <option value="">All genres</option>
        {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
      </select>
      <button type="submit" className="rounded-full bg-[#a24e35] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#833d2a]">Search</button>
    </form>
  )
}
