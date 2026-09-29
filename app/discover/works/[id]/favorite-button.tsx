"use client"

import { useState } from "react"
import { toggleFavorite } from "@/app/actions/favorites"

export function FavoriteButton({ workId, initialFavorited }: { workId: number; initialFavorited: boolean }) {
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
        className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-50"
      >
        {loading ? "Updating..." : favorited ? "Favorited" : "Add to library"}
      </button>
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
