import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FolderKanban } from "lucide-react"
import { getMyProfile } from "@/app/actions/profile"
import { getMyProject } from "@/app/actions/projects"
import { MusicianNavigation } from "@/components/musician-navigation"
import { requireRole } from "@/lib/session"
import { ProjectForm } from "../../project-form"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { id } = await params
  const projectId = Number(id)
  if (!Number.isInteger(projectId)) notFound()
  const [result, musicianProfile] = await Promise.all([getMyProject(projectId), getMyProfile()])
  if (!result) notFound()
  const { project } = result
  const roleLabel = user.role === "SUPER_ADMIN" ? "Super admin" : "Musician"
  const profileImage = musicianProfile.profile?.imageUrl ?? musicianProfile.account.image ?? null

  return (
    <main className="flex min-h-svh bg-[#f8f4ed] text-[#30251e]">
      <MusicianNavigation activeHref="/projects" name={user.name} roleLabel={roleLabel} imageUrl={profileImage} />
      <div className="ml-16 min-w-0 flex-1 md:ml-56 lg:ml-60">
        <div className="mx-auto w-full max-w-[1000px] px-5 py-7 sm:px-8 sm:py-9 xl:px-11">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#78685b] transition-colors hover:text-[#923f29]"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Cancel and return to project
          </Link>

          <section className="mt-6 rounded-[26px] border border-[#e9dac8] bg-[#fffdf8] p-5 shadow-[0_10px_35px_rgba(72,48,29,0.05)] sm:p-7 xl:p-8">
            <div className="mb-6 border-b border-[#eee3d7] pb-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f1e0cc] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#80553b]">
                <FolderKanban aria-hidden="true" className="h-3.5 w-3.5" />
                Project archive
              </span>
              <h1 className="mt-4 break-words font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Edit {project.title}</h1>
              <p className="mt-2 text-sm leading-6 text-[#78685b]">Update the details that describe this project in your archive.</p>
            </div>

            <ProjectForm initial={{ ...project, id: projectId }} />
          </section>
        </div>
      </div>
    </main>
  )
}
