import Link from "next/link"
import { getReports, hideReportedWork, resolveReport } from "@/app/actions/admin"
import { requireRole } from "@/lib/session"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"

export default async function AdminReportsPage() {
  await requireRole(["SUPER_ADMIN"])
  const reports = await getReports()

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Trust & safety</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review reports submitted about works in the archive.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="divide-y divide-border">
          {reports.map((report) => (
            <div key={report.id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${report.status === "OPEN" ? "bg-amber-400/15 text-amber-300" : "bg-emerald-400/15 text-emerald-300"}`}>
                      {report.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{report.createdAt.toLocaleString()}</span>
                  </div>
                  <Link href={`/works/${report.workId}`} className="mt-2 inline-block max-w-full truncate font-medium hover:text-primary hover:underline">
                    {report.workTitle ?? "Unknown work"}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">{report.reason} · {report.workArtist ?? "Unknown artist"}</p>
                </div>
                {report.status === "OPEN" ? (
                  <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                    <form
                      action={async () => {
                        "use server"
                        await resolveReport(report.id)
                      }}
                    >
                      <button type="submit" className="rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted">
                        Resolve
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server"
                        await hideReportedWork(report.id)
                      }}
                    >
                      <ConfirmSubmitButton message="Hide this work from public discovery and resolve the report?" className="rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10">
                        Hide work
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                ) : null}
              </div>
              {report.details ? <p className="mt-4 rounded-xl bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">{report.details}</p> : null}
            </div>
          ))}
        </div>
        {reports.length === 0 ? <p className="px-5 py-10 text-center text-sm text-muted-foreground">There are no reports to review.</p> : null}
      </div>
    </div>
  )
}
