import Link from "next/link"
import { redirect } from "next/navigation"
import { createProject, getMyProjects } from "@/app/actions/projects"
import { requireRole } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const projects = await getMyProjects()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">
              Reverb
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">projects</span>
          </div>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/works/new" className="hover:text-foreground">Add Work</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="font-serif text-3xl font-semibold">Your projects</h1>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {projects.length} total
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
              You have not created any projects yet.
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-foreground/30">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.workCount} works</p>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{project.releaseDate ? new Date(project.releaseDate).toLocaleDateString() : "No release date"}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-2xl font-semibold">Create a project</h2>
          <form
            action={async (formData) => {
              "use server"
              const title = String(formData.get("title") ?? "").trim()
              const description = String(formData.get("description") ?? "").trim()
              const createdDate = String(formData.get("createdDate") ?? "") || null
              const releaseDate = String(formData.get("releaseDate") ?? "") || null
              await createProject({ title, description: description || null, createdDate, releaseDate })
              redirect("/projects")
            }}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input name="title" required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-0" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea name="description" rows={4} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-0" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Created date</label>
                <input type="date" name="createdDate" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-0" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Release date</label>
                <input type="date" name="releaseDate" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-0" />
              </div>
            </div>
            <button type="submit" className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
              Save project
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
