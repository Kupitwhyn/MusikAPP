import { createGenre, deleteGenre, getGenresWithCounts } from "@/app/actions/admin"
import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"

export const dynamic = "force-dynamic"

export default async function AdminGenresPage() {
  await requireRole(["SUPER_ADMIN"])
  const genres = await getGenresWithCounts()

  return (
    <div className="mx-auto grid max-w-[1500px] gap-5 2xl:grid-cols-[0.8fr_1.2fr]">
      <section className="h-fit rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Archive taxonomy</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Genres</h1>
        <p className="mt-2 text-sm text-muted-foreground">Organize published works into searchable categories.</p>
        <form
          action={async (formData) => {
            "use server"
            const name = String(formData.get("name") ?? "").trim()
            await createGenre(name)
            redirect("/admin/genres")
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <label htmlFor="genre-name" className="mb-2 block text-sm font-medium">Genre name</label>
            <input id="genre-name" name="name" required className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <button type="submit" className="min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Add genre
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">All genres</h2>
          <span className="text-xs text-muted-foreground">{genres.length} total</span>
        </div>
        <div className="divide-y divide-border">
          {genres.map((genre) => (
            <div key={genre.id} className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <div>
                <p className="font-medium">{genre.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{genre.workCount} works</p>
              </div>
              <form
                action={async () => {
                  "use server"
                  await deleteGenre(genre.id)
                }}
              >
                <ConfirmSubmitButton message={`Delete the ${genre.name} genre? Works using it will become uncategorized.`} className="rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
        </div>
        {genres.length === 0 ? <p className="px-5 py-10 text-center text-sm text-muted-foreground">No genres have been created.</p> : null}
      </section>
    </div>
  )
}
