import Link from "next/link"
import { adminDeleteWork, getAllWorks, setWorkStatus } from "@/app/actions/admin"
import { requireRole } from "@/lib/session"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"

export default async function AdminWorksPage() {
  await requireRole(["SUPER_ADMIN"])
  const works = await getAllWorks()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="font-serif text-2xl font-semibold tracking-tight">Reverb Admin</Link>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/admin/users" className="hover:text-foreground">Users</Link>
            <Link href="/admin/genres" className="hover:text-foreground">Genres</Link>
            <Link href="/admin/reports" className="hover:text-foreground">Reports</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-serif text-3xl font-semibold">Works</h1>
        <div className="mt-6 space-y-3">
          {works.map((work) => (
            <div key={work.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{work.title}</p>
                <p className="text-sm text-muted-foreground">{work.artist}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {work.status}
                </span>
                <form
                  action={async () => {
                    "use server"
                    await setWorkStatus(work.id, work.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED")
                  }}
                >
                  <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted">
                    {work.status === "PUBLISHED" ? "Hide" : "Publish"}
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server"
                    await adminDeleteWork(work.id)
                  }}
                >
                  <ConfirmSubmitButton message="Delete this work permanently? This action cannot be undone." className="rounded-md border border-red-500/50 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10">
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
