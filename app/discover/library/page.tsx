import Image from "next/image"
import Link from "next/link"
import { Heart, Music2 } from "lucide-react"
import { getMyFavorites } from "@/app/actions/favorites"
import { getMyProfile } from "@/app/actions/profile"
import { MusicianNavigation } from "@/components/musician-navigation"
import { SignOutButton } from "@/components/sign-out-button"
import { requireRole } from "@/lib/session"

export default async function LibraryPage() {
  const user = await requireRole(["AUDIENCE", "MUSICIAN", "SUPER_ADMIN"])
  const isMusician = user.role === "MUSICIAN" || user.role === "SUPER_ADMIN"
  const [works, musicianProfile] = await Promise.all([
    getMyFavorites(),
    isMusician ? getMyProfile() : Promise.resolve(null),
  ])
  const profileImage = musicianProfile?.profile?.imageUrl ?? musicianProfile?.account.image ?? null
  const roleLabel = user.role === "SUPER_ADMIN" ? "Super admin" : "Musician"

  return (
    <main className={`min-h-svh bg-[#f8f4ed] text-[#30251e] ${isMusician ? "flex" : ""}`}>
      {isMusician ? (
        <MusicianNavigation activeHref="/discover/library" name={user.name} roleLabel={roleLabel} imageUrl={profileImage} />
      ) : (
        <header className="border-b border-[#e6d9c9] bg-[#fbf8f2]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
            <Link href="/discover" className="font-serif text-2xl font-semibold tracking-tight">Reverb</Link>
            <nav aria-label="Main navigation" className="flex items-center gap-2 text-xs text-[#78685b] sm:gap-4 sm:text-sm">
              <Link href="/discover" className="rounded-full px-2 py-2 transition-colors hover:bg-[#f0dfce] hover:text-[#963f22] sm:px-3">Discover</Link>
              <Link href="/discover/library" aria-current="page" className="rounded-full bg-[#f0dfce] px-3 py-2 font-semibold text-[#963f22]">My library</Link>
              <SignOutButton />
            </nav>
          </div>
        </header>
      )}

      <div className={`min-w-0 flex-1 ${isMusician ? "ml-16 md:ml-56 lg:ml-60" : ""}`}>
        <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 sm:py-9 xl:px-11">
          <header className="rounded-[26px] border border-[#ead8c5] bg-gradient-to-br from-[#fbf5eb] via-[#f5e7d8] to-[#eddbc8] px-6 py-7 sm:px-9 sm:py-9">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a24e35]">
              <Heart aria-hidden="true" className="h-4 w-4" />
              Saved collection
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Your library</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f6257] sm:text-base">
              {isMusician
                ? "A personal collection of works to revisit, study, and keep close."
                : "The works you have saved from across the Reverb archive."}
            </p>
            <p className="mt-5 text-xs font-medium text-[#80553b]">
              {works.length} {works.length === 1 ? "saved work" : "saved works"}
            </p>
          </header>

          <section aria-label="Saved works" className="mt-8">
            {works.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#ddc8b2] bg-[#fffdf8] px-6 py-12 text-center shadow-[0_10px_35px_rgba(72,48,29,0.04)]">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f2e5d7] text-[#a24e35]">
                  <Heart aria-hidden="true" className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-serif text-xl font-semibold">Your library is ready to grow</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#78685b]">
                  Save a work while exploring Discover and it will be collected here.
                </p>
                <Link href="/discover" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-[#a24e35] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#833d2a]">
                  Explore Discover
                </Link>
              </div>
            ) : (
              <div className={isMusician ? "grid gap-3" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"}>
                {works.map((work) => (
                  <Link
                    key={work.id}
                    href={`/discover/works/${work.id}`}
                    className={`group border border-[#e9dac8] bg-[#fffdf8] shadow-[0_8px_24px_rgba(72,48,29,0.035)] transition-all hover:border-[#c88d68] hover:shadow-[0_12px_30px_rgba(72,48,29,0.08)] ${
                      isMusician
                        ? "flex min-w-0 items-center gap-3 rounded-[18px] p-3 hover:-translate-y-0.5 sm:gap-4 sm:p-3.5"
                        : "overflow-hidden rounded-[22px] hover:-translate-y-0.5"
                    }`}
                  >
                    <div className={`relative shrink-0 overflow-hidden bg-[#ead9c7] ${
                      isMusician ? "h-20 w-20 rounded-xl sm:h-[88px] sm:w-[88px]" : "aspect-square"
                    }`}>
                      {work.artworkUrl ? (
                        <Image
                          src={work.artworkUrl}
                          alt=""
                          fill
                          unoptimized
                          sizes={isMusician ? "88px" : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#a87352]">
                          <Music2 aria-hidden="true" className={isMusician ? "h-7 w-7" : "h-10 w-10"} strokeWidth={1.5} />
                        </div>
                      )}
                      <span className={`absolute flex items-center justify-center rounded-full bg-[#fffdf8]/90 text-[#a24e35] shadow-sm ${
                        isMusician ? "right-1.5 top-1.5 h-6 w-6" : "right-3 top-3 h-9 w-9"
                      }`}>
                        <Heart aria-hidden="true" className="h-4 w-4 fill-current" />
                      </span>
                    </div>
                    <div className={isMusician ? "min-w-0 flex-1" : "p-4"}>
                      <h2 className={`truncate font-serif font-semibold transition-colors group-hover:text-[#963f22] ${
                        isMusician ? "text-base sm:text-lg" : "text-lg"
                      }`}>{work.title}</h2>
                      <p className={`truncate text-[#78685b] ${isMusician ? "mt-0.5 text-xs sm:text-sm" : "mt-0.5 text-sm"}`}>{work.artist}</p>
                      <div className={`flex flex-wrap items-center gap-2 text-xs text-[#8d7b6b] ${
                        isMusician ? "mt-2" : "mt-3"
                      }`}>
                        <span className="rounded-full bg-[#f3e4d3] px-2.5 py-1 text-[#8a4b31]">{work.genreName ?? "Independent"}</span>
                        {work.musicianName ? <span className="truncate">by {work.musicianName}</span> : null}
                      </div>
                    </div>
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
