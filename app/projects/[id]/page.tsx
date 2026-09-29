import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { deleteProject, getMyProject } from "@/app/actions/projects"
import { requireRole } from "@/lib/session"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { id } = await params
  const projectId = Number(id)
  if (!Number.isInteger(projectId)) notFound()
  const result = await getMyProject(projectId)
  if (!result) notFound()
  const { project, works } = result

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">Back to projects</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">project</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">{project.title}</h1>
          {project.description && <p className="mt-3 max-w-2xl text-muted-foreground">{project.description}</p>}
          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <Meta label="Created" value={project.createdDate} />
            <Meta label="Release date" value={project.releaseDate} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/projects/${project.id}/edit`} className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">Edit project</Link>
            <Link href={`/works/new`} className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">Add work</Link>
            <form action={async () => { "use server"; await deleteProject(project.id); redirect("/projects") }}>
              <ConfirmSubmitButton message="Delete this project? Works will be detached but not deleted." className="rounded-md border border-destructive/50 px-4 py-2 text-sm text-destructive hover:bg-destructive/10">Delete project</ConfirmSubmitButton>
            </form>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold">Works in this project</h2>
            <span className="text-sm text-muted-foreground">{works.length} total</span>
          </div>
          {works.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">No works assigned to this project yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {works.map((work) => (
                <Link key={work.id} href={`/works/${work.id}`} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-foreground/30">
                  <div><p className="font-medium">{work.title}</p><p className="text-sm text-muted-foreground">{work.artist}</p></div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{work.status}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1">{value || "—"}</p></div>
}
