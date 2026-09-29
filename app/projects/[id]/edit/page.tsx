import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getMyProject, updateProject } from "@/app/actions/projects"
import { requireRole } from "@/lib/session"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { id } = await params
  const projectId = Number(id)
  if (!Number.isInteger(projectId)) notFound()
  const result = await getMyProject(projectId)
  if (!result) notFound()
  const { project } = result

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
          <Link href={`/projects/${projectId}`} className="text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <section className="rounded-xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">edit project</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold">{project.title}</h1>
          <form action={async (formData) => {
            "use server"
            await updateProject(projectId, {
              title: String(formData.get("title") ?? ""),
              description: String(formData.get("description") ?? ""),
              createdDate: String(formData.get("createdDate") ?? "") || null,
              releaseDate: String(formData.get("releaseDate") ?? "") || null,
            })
            redirect(`/projects/${projectId}`)
          }} className="mt-6 space-y-4">
            <Field label="Title" name="title" defaultValue={project.title} required />
            <div><label className="mb-1 block text-sm font-medium" htmlFor="description">Description</label><textarea id="description" name="description" rows={5} defaultValue={project.description ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Created date" name="createdDate" type="date" defaultValue={project.createdDate ?? ""} />
              <Field label="Release date" name="releaseDate" type="date" defaultValue={project.releaseDate ?? ""} />
            </div>
            <button type="submit" className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">Save changes</button>
          </form>
        </section>
      </div>
    </main>
  )
}

function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue?: string; type?: string; required?: boolean }) {
  return <div><label className="mb-1 block text-sm font-medium" htmlFor={name}>{label}</label><input id={name} name={name} type={type} defaultValue={defaultValue} required={required} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></div>
}
