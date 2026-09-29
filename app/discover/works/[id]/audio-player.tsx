"use client"

import { incrementPlayCount } from "@/app/actions/discover"

export function AudioPlayer({ workId, audioUrl }: { workId: number; audioUrl: string }) {
  return (
    <audio
      controls
      src={audioUrl}
      onPlay={() => {
        void incrementPlayCount(workId)
      }}
      className="mt-7 w-full"
    />
  )
}
