import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, CalendarDays, FolderKanban, Music2, Plus, Trash2 } from "lucide-react"
import { getMyProfile } from "@/app/actions/profile"
import { deleteProject, getMyProject } from "@/app/actions/projects"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"
import { MusicianNavigation } from "@/components/musician-navigation"
import { requireRole } from "@/lib/session"

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { id } = await params
  const projectId = Number(id)
  if (!Number.isInteger(projectId)) notFound()
  const [result, musicianProfile] = await Promise.all([getMyProject(projectId), getMyProfile()])
  if (!result) notFound()
  const { project, works } = result
  const roleLabel = user.role === "SUPER_ADMIN" ? "Super admin" : "Musician"
  const profileImage = musicianProfile.profile?.imageUrl ?? musicianProfile.account.image ?? null

  return (
    <main className="flex min-h-svh bg-[#f8f4ed] text-[#30251e]">
      <MusicianNavigation activeHref="/projects" name={user.name} roleLabel={roleLabel} imageUrl={profileImage} />
      <div className="ml-16 min-w-0 flex-1 md:ml-56 lg:ml-60">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-7 sm:px-8 sm:py-9 xl:px-11">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#78685b] transition-colors hover:text-[#923f29]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to projects
          </Link>

          <section className="mt-6 rounded-[26px] border border-[#ead8c5] bg-gradient-to-br from-[#fbf5eb] via-[#f5e7d8] to-[#eddbc8] p-6 shadow-[0_10px_35px_rgba(72,48,29,0.045)] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#ead8c5] text-[#995033] sm:h-32 sm:w-32">
                  {project.artworkUrl ? (
                    <Image src={project.artworkUrl} alt={`${project.title} artwork`} fill unoptimized sizes="128px" className="object-cover" />
                  ) : (
                    <FolderKanban aria-hidden="true" className="h-8 w-8" strokeWidth={1.6} />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#ead8c8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#80553b]">
                    <FolderKanban aria-hidden="true" className="h-3.5 w-3.5" />
                    Project archive
                  </span>
                  <h1 className="mt-4 break-words font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h1>
                  {project.description && <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-[#6f6257] sm:text-base">{project.description}</p>}
                </div>
              </div>
              <span className="rounded-full border border-[#dfc7b1] bg-[#fffaf3]/75 px-3 py-1.5 text-xs font-medium text-[#80553b]">
                {works.length} {works.length === 1 ? "work" : "works"}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Meta label="Created" value={project.createdDate} />
              <Meta label="Release date" value={project.releaseDate} />
            </div>

            <div className="mt-7 flex flex-wrap gap-3 border-t border-[#dfcbb7] pt-5">
              <Link
                href={`/projects/${project.id}/edit`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#a24e35] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#833d2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a24e35] focus-visible:ring-offset-2"
              >
                Edit project
              </Link>
              <Link
                href="/works/new"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9bda5] bg-[#fffdf8] px-5 py-2.5 text-sm font-semibold text-[#80553b] transition-colors hover:border-[#bd825e] hover:bg-[#f8eee3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a24e35] focus-visible:ring-offset-2"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Add work
              </Link>
              <form action={async () => { "use server"; await deleteProject(project.id); redirect("/projects") }}>
                <ConfirmSubmitButton
                  message="Delete this project? Works will be detached but not deleted."
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9b7a6] bg-transparent px-5 py-2.5 text-sm font-medium text-[#923f29] transition-colors hover:bg-[#f8e9df] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a24e35] focus-visible:ring-offset-2"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Delete project
                </ConfirmSubmitButton>
              </form>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a24e35]">Collected in this project</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight">Works in this project</h2>
              </div>
              <span className="text-sm text-[#78685b]">{works.length} total</span>
            </div>
            {works.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-[#ddc8b2] bg-[#fffdf8] px-5 py-8 text-center">
                <Music2 aria-hidden="true" className="mx-auto h-7 w-7 text-[#bd825e]" />
                <p className="mt-3 font-serif text-lg font-semibold">No works in this project yet</p>
                <p className="mt-1 text-sm text-[#78685b]">Add a work and assign it to this project to build the collection.</p>
                <Link href="/works/new" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#a24e35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#833d2a]">
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Add work
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {works.map((work) => (
                  <Link
                    key={work.id}
                    href={`/works/${work.id}`}
                    className="group flex min-w-0 items-center justify-between gap-4 rounded-[20px] border border-[#e9dac8] bg-[#fffdf8] p-4 shadow-[0_8px_24px_rgba(72,48,29,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#c88d68] hover:shadow-[0_12px_30px_rgba(72,48,29,0.08)]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#ead8c5] text-[#995033]">
                        {work.artworkUrl ? (
                          <Image src={work.artworkUrl} alt="" fill unoptimized sizes="56px" className="object-cover" />
                        ) : (
                          <Music2 aria-hidden="true" className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-serif text-lg font-semibold transition-colors group-hover:text-[#963f22]">{work.title}</p>
                        <p className="truncate text-sm text-[#78685b]">{work.artist}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#f2e5d7] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[#80553b]">
                      {work.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e5d2bf] bg-[#fffaf3]/75 p-4">
      <CalendarDays aria-hidden="true" className="h-4 w-4 shrink-0 text-[#ad5034]" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9b6a51]">{label}</p>
        <p className="mt-1 break-words text-sm text-[#3b2d26]">{value || "—"}</p>
      </div>
    </div>
  )
}
