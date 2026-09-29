import Link from "next/link"
import { createGenre, deleteGenre, getGenresWithCounts } from "@/app/actions/admin"
import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"

export const dynamic = "force-dynamic"

export default async function AdminGenresPage() {
  await requireRole(["SUPER_ADMIN"])
  const genres = await getGenresWithCounts()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="font-serif text-2xl font-semibold tracking-tight">Reverb Admin</Link>
          <nav className="flex items-center gap-3 text-sm text-muted-foreground">
            <Link href="/admin/users" className="hover:text-foreground">Users</Link>
            <Link href="/admin/works" className="hover:text-foreground">Works</Link>
            <Link href="/admin/reports" className="hover:text-foreground">Reports</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-xl border border-border bg-card p-6">
          <h1 className="font-serif text-3xl font-semibold">Genres</h1>
          <form
            action={async (formData) => {
              "use server"
              const name = String(formData.get("name") ?? "").trim()
              await createGenre(name)
              redirect("/admin/genres")
            }}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">Genre name</label>
              <input name="name" required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">
              Add genre
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <div className="space-y-3">
            {genres.map((genre) => (
              <div key={genre.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{genre.name}</p>
                  <p className="text-sm text-muted-foreground">{genre.workCount} works</p>
                </div>
                <form
                  action={async () => {
                    "use server"
                    await deleteGenre(genre.id)
                  }}
                >
                  <ConfirmSubmitButton message={`Delete the ${genre.name} genre? Works using it will become uncategorized.`} className="rounded-md border border-red-500/50 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10">
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
