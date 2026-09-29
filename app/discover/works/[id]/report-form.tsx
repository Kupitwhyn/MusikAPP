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

export function ReportForm({ workId }: { workId: number }) {
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
      <button type="button" onClick={() => setOpen(true)} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
        Report work
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 w-full rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex-1 text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Reason</span>
          <select value={reason} onChange={(event) => {
            const nextReason = reasons.find(([value]) => value === event.target.value)?.[0]
            if (nextReason) setReason(nextReason)
          }} className="w-full rounded-md border border-border bg-background px-3 py-2">
            {reasons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="flex-[2] text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Details (optional)</span>
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1000} rows={2} className="w-full resize-none rounded-md border border-border bg-background px-3 py-2" />
        </label>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={isPending} className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50">
          {isPending ? "Submitting..." : "Submit report"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    </form>
  )
}
