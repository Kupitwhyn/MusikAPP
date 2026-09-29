import Link from "next/link"
import { getReports, hideReportedWork, resolveReport } from "@/app/actions/admin"
import { requireRole } from "@/lib/session"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"

export default async function AdminReportsPage() {
  await requireRole(["SUPER_ADMIN"])
  const reports = await getReports()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="font-serif text-2xl font-semibold tracking-tight">Reverb Admin</Link>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/admin/users" className="hover:text-foreground">Users</Link>
            <Link href="/admin/works" className="hover:text-foreground">Works</Link>
            <Link href="/admin/genres" className="hover:text-foreground">Genres</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-serif text-3xl font-semibold">Reports</h1>
        <div className="mt-6 space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Link href={`/works/${report.workId}`} className="font-medium hover:underline">{report.workTitle ?? "Unknown work"}</Link>
                  <p className="text-sm text-muted-foreground">{report.reason} · {report.workArtist ?? "Unknown artist"}</p>
                  <p className="text-xs text-muted-foreground">{report.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-border px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {report.status}
                  </span>
                  {report.status === "OPEN" && <form
                    action={async () => {
                      "use server"
                      await resolveReport(report.id)
                    }}
                  >
                    <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                      Resolve
                    </button>
                  </form>}
                  {report.status === "OPEN" && <form
                    action={async () => {
                      "use server"
                      await hideReportedWork(report.id)
                    }}
                  >
                    <ConfirmSubmitButton message="Hide this work from public discovery and resolve the report?" className="rounded-md border border-red-500/50 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10">
                      Hide work
                    </ConfirmSubmitButton>
                  </form>}
                </div>
              </div>
              {report.details && <p className="mt-3 text-sm text-muted-foreground">{report.details}</p>}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
