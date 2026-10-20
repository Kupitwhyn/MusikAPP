import Link from "next/link"
import { getMyProfile } from "@/app/actions/profile"
import { getMyWorks } from "@/app/actions/works"
import { MusicianNavigation } from "@/components/musician-navigation"
import { requireRole } from "@/lib/session"

export default async function WorksPage() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [works, musicianProfile] = await Promise.all([getMyWorks(), getMyProfile()])
  const roleLabel = user.role === "SUPER_ADMIN" ? "Super admin" : "Musician"
  const profileImage = musicianProfile.profile?.imageUrl ?? musicianProfile.account.image ?? null

  return (
    <main className="flex min-h-svh bg-[#f8f4ed] text-[#30251e]">
      <MusicianNavigation activeHref="/works" name={user.name} roleLabel={roleLabel} imageUrl={profileImage} />
      <div className="ml-16 min-w-0 flex-1 md:ml-56 lg:ml-60">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-8 sm:px-8 sm:py-10 xl:px-11">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a24e35]">My archive</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Works</h1>
          </div>
          <span className="rounded-full bg-[#f0dfce] px-3 py-1.5 text-xs font-medium text-[#80553b]">{works.length} {works.length === 1 ? "work" : "works"}</span>
        </div>
        {works.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#ddc8b2] bg-[#fffdf8] p-8 text-center shadow-[0_10px_35px_rgba(72,48,29,0.04)] sm:p-10">
            <p className="font-serif text-xl font-semibold">Your archive starts here</p>
            <p className="mt-2 text-sm text-[#78685b]">Add your first finished work to begin building your collection.</p>
            <Link href="/works/new" className="mt-5 inline-flex rounded-full bg-[#a24e35] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#833d2a]">Add your first work</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {works.map((item) => (
              <Link key={item.id} href={`/works/${item.id}`} className="group flex gap-4 rounded-[22px] border border-[#e9dac8] bg-[#fffdf8] p-4 shadow-[0_8px_24px_rgba(72,48,29,0.035)] transition-all hover:-translate-y-0.5 hover:border-[#c88d68] hover:shadow-[0_12px_30px_rgba(72,48,29,0.08)]">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#ead9c7]">
                  {item.artworkUrl && <img src={item.artworkUrl} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-serif text-xl font-semibold group-hover:text-[#963f22]">{item.title}</h2>
                  <p className="text-sm text-[#78685b]">{item.artist}</p>
                  <p className="mt-3 text-xs text-[#9b8978]">{item.genreName ?? "Unassigned"}{item.projectTitle ? ` · ${item.projectTitle}` : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      </div>
    </main>
  )
}
