"use client"

import { useState, useTransition } from "react"
import { submitReport } from "@/app/actions/discover"

const reasons = [
  ["COPYRIGHT", "Copyright concern"],
  ["INAPPROPRIATE", "Inappropriate content"],
  ["MISLEADING", "Misleading information"],
  ["OTHER", "Other"],
] as const
type ReportReason = (typeof reasons)[number][0]

export function ReportForm({ workId, musicianStyle = false }: { workId: number; musicianStyle?: boolean }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>(reasons[0][0])
  const [details, setDetails] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    startTransition(async () => {
      try {
        await submitReport(workId, reason, details)
        setMessage("Report submitted. Thank you.")
        setDetails("")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to submit report")
      }
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm transition-colors ${
          musicianStyle
            ? "border border-[#e4d6c8] bg-transparent text-[#78685b] hover:bg-[#f3e8dc] hover:text-[#923f29]"
            : "rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        Report work
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`mt-3 w-full rounded-xl border p-4 ${
      musicianStyle ? "border-[#e4d6c8] bg-[#fffcf7]" : "border-border bg-muted/30"
    }`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm">
          <span className={`mb-1 block text-xs uppercase tracking-wider ${musicianStyle ? "text-[#9b6a51]" : "text-muted-foreground"}`}>Reason</span>
          <select value={reason} onChange={(event) => {
            const nextReason = reasons.find(([value]) => value === event.target.value)?.[0]
            if (nextReason) setReason(nextReason)
          }} className={`w-full rounded-lg border px-3 py-2 ${
            musicianStyle ? "border-[#e4d6c8] bg-[#fffcf7] text-[#30251e]" : "border-border bg-background"
          }`}>
            {reasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="flex-[2] text-sm">
          <span className={`mb-1 block text-xs uppercase tracking-wider ${musicianStyle ? "text-[#9b6a51]" : "text-muted-foreground"}`}>Details (optional)</span>
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1000} rows={2} className={`w-full resize-none rounded-lg border px-3 py-2 ${
            musicianStyle ? "border-[#e4d6c8] bg-[#fffcf7] text-[#30251e]" : "border-border bg-background"
          }`} />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={isPending} className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
          musicianStyle ? "bg-[#a24e35] text-white hover:bg-[#833d2a]" : "rounded-md bg-foreground text-background"
        }`}>
          {isPending ? "Submitting..." : "Submit report"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className={`text-sm ${musicianStyle ? "text-[#78685b] hover:text-[#30251e]" : "text-muted-foreground hover:text-foreground"}`}>Cancel</button>
        {message && <span role="status" className={`text-sm ${musicianStyle ? "text-[#78685b]" : "text-muted-foreground"}`}>{message}</span>}
      </div>
    </form>
  )
}
