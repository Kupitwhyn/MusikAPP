"use client"

import { useState } from "react"
import { toggleFavorite } from "@/app/actions/favorites"

export function FavoriteButton({
  workId,
  initialFavorited,
  musicianStyle = false,
}: {
  workId: number
  initialFavorited: boolean
  musicianStyle?: boolean
}) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true)
          setError(null)
          try {
            const result = await toggleFavorite(workId)
            setFavorited(result.favorited)
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Unable to update library")
          } finally {
            setLoading(false)
          }
        }}
        className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          musicianStyle
            ? "bg-[#a24e35] text-white hover:bg-[#833d2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a24e35] focus-visible:ring-offset-2"
            : "rounded-md border border-border hover:bg-muted"
        }`}
      >
        {loading ? "Updating..." : favorited ? "Favorited" : "Add to library"}
      </button>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
