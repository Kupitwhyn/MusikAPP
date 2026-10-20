import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, ChevronRight, FolderKanban, Music2, Plus } from "lucide-react"
import { getMyProjects } from "@/app/actions/projects"
import { getMyProfile } from "@/app/actions/profile"
import { MusicianNavigation } from "@/components/musician-navigation"
import { requireRole } from "@/lib/session"
import { ProjectForm } from "./project-form"

export const dynamic = "force-dynamic"

export default async function ProjectsPage() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [projects, musicianProfile] = await Promise.all([getMyProjects(), getMyProfile()])
  const roleLabel = user.role === "SUPER_ADMIN" ? "Super admin" : "Musician"
  const profileImage = musicianProfile.profile?.imageUrl ?? musicianProfile.account.image ?? null
  const heroArtwork = projects.find((project) => project.artworkUrl)?.artworkUrl

  return (
    <main className="flex min-h-svh bg-[#f8f4ed] text-[#30251e]">
      <MusicianNavigation activeHref="/projects" name={user.name} roleLabel={roleLabel} imageUrl={profileImage} />

      <div className="ml-16 min-w-0 flex-1 md:ml-56 lg:ml-60">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-8 sm:py-8 xl:px-11">
          <section className="relative isolate overflow-hidden rounded-[28px] border border-[#ead8c5] bg-[#f3e4d3] px-6 py-7 sm:px-9 sm:py-9">
            {heroArtwork ? (
              <>
                <Image src={heroArtwork} alt="" fill unoptimized loading="eager" sizes="(max-width: 1024px) 100vw, 1200px" className="absolute inset-0 -z-20 object-cover object-[65%_center] opacity-25" />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#fbf5eb] via-[#fbf5eb]/90 to-[#fbf5eb]/25" />
              </>
            ) : (
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fbf3e8] via-[#f2dfca] to-[#e9c5a6]" />
            )}
            <div className="relative flex min-h-[165px] items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a64c2a]">Your projects</p>
                <h1 className="mt-3 max-w-xl font-serif text-3xl font-semibold leading-tight tracking-tight text-[#30251e] sm:text-4xl">
                  Turn your ideas into something real.
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-[#6f6257] sm:text-base">
                  Organize your projects and bring your music to life.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-6 grid items-start gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[24px] border border-[#e9dac8] bg-[#fffdf8] p-5 shadow-[0_10px_35px_rgba(72,48,29,0.04)] sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#30251e] sm:text-3xl">Your projects</h2>
                <span className="rounded-full bg-[#f2e5d7] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#80553b]">
                  {projects.length} total
                </span>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#ddc8b2] bg-[#fcf8f1] px-5 py-9 text-center">
                  <FolderKanban aria-hidden="true" className="mx-auto h-8 w-8 text-[#a96a47]" strokeWidth={1.6} />
                  <p className="mt-3 font-serif text-lg font-semibold">No projects yet</p>
                  <p className="mt-1 text-sm leading-5 text-[#78685b]">Create a project to bring related works together.</p>
                  <a href="#create-project" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#a24e35] hover:text-[#783a28]">
                    Start a project <ChevronRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <ul className="space-y-3">
                  {projects.map((project) => (
                      <li key={project.id}>
                        <Link
                          href={`/projects/${project.id}`}
                          className="group flex min-w-0 items-center gap-3 rounded-[20px] border border-[#eadfd2] bg-[#fcfaf6] p-3 transition-all hover:border-[#c88d68] hover:bg-[#fffaf2] sm:gap-4 sm:p-4"
                        >
                          <div className="relative flex h-[84px] w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#ead8c5] text-[#995033] sm:h-[100px] sm:w-[100px]">
                            {project.artworkUrl ? (
                              <Image src={project.artworkUrl} alt="" fill unoptimized sizes="100px" className="object-cover transition-transform group-hover:scale-105" />
                            ) : (
                              <FolderKanban aria-hidden="true" className="h-8 w-8" strokeWidth={1.6} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-serif text-lg font-semibold text-[#30251e] group-hover:text-[#963f22] sm:text-xl">{project.title}</h3>
                            {project.description ? (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#78685b] sm:text-sm">{project.description}</p>
                            ) : null}
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8d7b6b]">
                              <span className="inline-flex items-center gap-1.5">
                                <Music2 aria-hidden="true" className="h-3.5 w-3.5" />
                                {project.workCount} {project.workCount === 1 ? "work" : "works"}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                                Created {formatDate(project.createdDate)}
                              </span>
                            </div>
                          </div>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3e4d3] text-[#a24e35] transition-transform group-hover:translate-x-0.5">
                            <ChevronRight aria-hidden="true" className="h-4 w-4" />
                          </span>
                        </Link>
                      </li>
                  ))}
                </ul>
              )}

              {projects.length > 0 ? (
                <a href="#create-project" className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#dfcbb7] px-4 py-4 text-sm font-medium text-[#75452e] transition-colors hover:border-[#bd825e] hover:bg-[#fcf8f1]">
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  New project
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              ) : null}
            </section>

            <section id="create-project" className="scroll-mt-6 rounded-[24px] border border-[#e9dac8] bg-[#fffdf8] p-5 shadow-[0_10px_35px_rgba(72,48,29,0.04)] sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f1e0cc] text-[#a24e35]">
                  <FolderKanban aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#30251e]">Create a project</h2>
                  <p className="mt-1 text-sm leading-5 text-[#78685b]">Give your project a name and a short description.</p>
                </div>
              </div>
              <ProjectForm />
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

function formatDate(value: string | null) {
  if (!value) return "Not set"
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return "Not set"
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date)
}
