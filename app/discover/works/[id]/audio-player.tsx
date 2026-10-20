"use client"

import { incrementPlayCount } from "@/app/actions/discover"

export function AudioPlayer({
  workId,
  audioUrl,
  musicianStyle = false,
}: {
  workId: number
  audioUrl: string
  musicianStyle?: boolean
}) {
  return (
    <audio
      controls
      src={audioUrl}
      onPlay={() => {
        void incrementPlayCount(workId)
      }}
      className={`w-full accent-[#a24e35] ${musicianStyle ? "" : "mt-7"}`}
    />
  )
}
