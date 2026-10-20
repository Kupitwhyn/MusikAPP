import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  ChevronRight,
  FolderKanban,
  FolderOpen,
  Music2,
  Plus,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { getMyProjects } from "@/app/actions/projects"
import { getMyProfile } from "@/app/actions/profile"
import { getMyStats, getMyWorks } from "@/app/actions/works"
import { MusicianNavigation } from "@/components/musician-navigation"
import { requireRole } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [stats, works, projects, musicianProfile] = await Promise.all([getMyStats(), getMyWorks(), getMyProjects(), getMyProfile()])
  const recentWorks = works.slice(0, 5)
  const recentProjects = projects.slice(0, 4)
  const featuredArtwork = works.find((work) => work.artworkUrl)?.artworkUrl
  const profileImage = musicianProfile.profile?.imageUrl ?? musicianProfile.account.image ?? null
  const roleLabel = user.role === "SUPER_ADMIN" ? "Super admin" : "Musician"

  return (
    <main className="flex min-h-svh bg-background text-foreground">
      <MusicianNavigation activeHref="/dashboard" name={user.name} roleLabel={roleLabel} imageUrl={profileImage} />

      <div className="ml-16 min-w-0 flex-1 md:ml-56 lg:ml-60">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 xl:px-11">
          <section className="relative isolate overflow-hidden rounded-[28px] border border-[#ead8c5] bg-[#f3e4d3] px-6 py-8 sm:px-9 sm:py-10 lg:min-h-[230px] lg:px-11 lg:py-10">
            {featuredArtwork ? (
              <>
                <Image
                  src={featuredArtwork}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="absolute inset-0 -z-20 object-cover object-[65%_center] opacity-30"
                />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#fbf5eb] via-[#fbf5eb]/90 to-[#fbf5eb]/20" />
              </>
            ) : (
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-[#fbf3e8] via-[#f2dfca] to-[#e9c5a6]" />
            )}

            <div className="relative flex h-full min-h-[190px] flex-col justify-center lg:min-h-[150px]">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold tracking-wide text-[#a64c2a]">Welcome back,</p>
                <h1 className="mt-1 font-serif text-3xl font-semibold leading-tight tracking-tight text-[#30251e] sm:text-4xl lg:text-[42px]">
                  {user.name}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f6257] sm:text-base">
                  Keep creating, your music is reaching people.
                  <br className="hidden sm:block" /> Here&apos;s what&apos;s happening with your works and projects.
                </p>
              </div>
            </div>
          </section>

          <section aria-label="Archive overview" className="mt-6 grid gap-4 md:grid-cols-3">
            <StatCard icon={Music2} label="Total works" value={String(stats.totalWorks)} />
            <StatCard icon={FolderOpen} label="Total projects" value={String(stats.totalProjects)} />
            <StatCard icon={UserRound} label="Role" value={roleLabel} />
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
            <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_10px_35px_rgba(72,48,29,0.04)] sm:p-7">
              <SectionHeading title="Recent works" href="/works" action="View all" />
              {recentWorks.length === 0 ? (
                <EmptyPanel
                  title="Your archive starts here"
                  description="Add your first finished work and it will appear in this list."
                  href="/works/new"
                  action="Add your first work"
                />
              ) : (
                <ul className="divide-y divide-border">
                  {recentWorks.map((work) => (
                    <li key={work.id}>
                      <Link
                        href={`/works/${work.id}`}
                        className="group flex min-w-0 items-center gap-3 py-3.5 first:pt-1 last:pb-1 sm:gap-4"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#ead9c7]">
                          {work.artworkUrl ? (
                            <Image
                              src={work.artworkUrl}
                              alt={`Artwork for ${work.title}`}
                              fill
                              unoptimized
                              sizes="56px"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <Music2 aria-hidden="true" className="absolute inset-0 m-auto h-6 w-6 text-[#a75a37]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-base font-semibold text-foreground group-hover:text-[#963f22]">{work.title}</p>
                          <p className="truncate text-sm text-muted-foreground">{work.artist}</p>
                        </div>
                        <span className="hidden rounded-full bg-[#f1e4d5] px-3 py-1 text-xs text-[#71432e] sm:inline-flex">
                          {work.genreName ?? "Unassigned"}
                        </span>
                        <span className="hidden w-24 shrink-0 text-right text-xs text-muted-foreground md:block">
                          {formatDate(work.releasedDate)}
                        </span>
                        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#ad6541] transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[24px] border border-border bg-card p-5 shadow-[0_10px_35px_rgba(72,48,29,0.04)] sm:p-7">
              <SectionHeading title="Projects" href="/projects" action="Manage" />
              {recentProjects.length === 0 ? (
                <EmptyPanel
                  title="No projects yet"
                  description="Bring related works together in a project."
                  href="/projects"
                  action="Create a project"
                />
              ) : (
                <ul className="space-y-3">
                  {recentProjects.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={`/projects/${project.id}`}
                        className="group flex items-center gap-4 rounded-2xl border border-[#e9dfd3] bg-[#fcf8f1] p-3.5 transition-colors hover:border-[#d5ad8b]"
                      >
                        <div className="relative flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#ead8c5] text-[#995033]">
                          {project.artworkUrl ? (
                            <Image
                              src={project.artworkUrl}
                              alt=""
                              fill
                              unoptimized
                              sizes="68px"
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <FolderKanban aria-hidden="true" className="h-7 w-7" strokeWidth={1.7} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-lg font-semibold group-hover:text-[#963f22]">{project.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{project.workCount} {project.workCount === 1 ? "work" : "works"}</p>
                          {project.description ? (
                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{project.description}</p>
                          ) : null}
                        </div>
                        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#ad6541] transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/projects"
                className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-[#dfcbb7] px-4 py-3.5 text-sm text-[#75452e] transition-colors hover:border-[#bd825e] hover:bg-[#fcf8f1]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2e3d2] text-[#a24e35]">
                  <Plus aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">Start a new project</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">Organize your ideas and works.</span>
                </span>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-h-[110px] items-center gap-4 rounded-[20px] border border-[#ecd9c5] bg-card px-5 py-4 shadow-[0_8px_24px_rgba(72,48,29,0.035)] sm:px-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ad4c2a] text-white">
        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86634d]">{label}</p>
        <p className="mt-1 truncate font-serif text-2xl font-semibold tracking-tight text-[#30251e] sm:text-3xl">{value}</p>
      </div>
    </div>
  )
}

function SectionHeading({ title, href, action }: { title: string; href: string; action: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-serif text-2xl font-semibold tracking-tight text-[#30251e]">{title}</h2>
      <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#a24e35] hover:text-[#783a28]">
        {action}
        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  )
}

function EmptyPanel({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#dfcbb7] bg-[#fcf8f1] px-5 py-8 text-center">
      <p className="font-serif text-lg font-semibold text-[#30251e]">{title}</p>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-muted-foreground">{description}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#a24e35] hover:text-[#783a28]">
        {action}
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </div>
  )
}

function formatDate(value: Date | string | null) {
  if (!value) return "No release date"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "No release date"
  return new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(date)
}
