import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Music2, Trash2 } from "lucide-react"
import { getMyProfile } from "@/app/actions/profile"
import { deleteWork, getMyWork } from "@/app/actions/works"
import { ConfirmSubmitButton } from "@/components/confirm-submit-button"
import { MusicianNavigation } from "@/components/musician-navigation"
import { requireRole } from "@/lib/session"

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { id } = await params
  const workId = Number(id)
  if (!Number.isInteger(workId)) notFound()
  const result = await getMyWork(workId)
  if (!result) notFound()

  const item = result.work
  const artworkUrl = result.projectArtworkUrl ?? item.artworkUrl
  const isPublished = item.status === "PUBLISHED"
  const hasAudio = Boolean(item.audioUrl.trim())
  const musicianProfile = await getMyProfile()
  const roleLabel = user.role === "SUPER_ADMIN" ? "Super admin" : "Musician"
  const profileImage = musicianProfile.profile?.imageUrl ?? musicianProfile.account.image ?? null

  return (
    <main className="flex min-h-svh bg-[#f7f2ea] text-[#2c211c]">
      <MusicianNavigation activeHref="/works" name={user.name} roleLabel={roleLabel} imageUrl={profileImage} />
      <div className="ml-16 min-w-0 flex-1 md:ml-56 lg:ml-60">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 sm:py-10 lg:py-12">
        <div className="mb-7">
          <Link
            href="/works"
            className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-[#78685b] outline-none transition-colors hover:text-[#923f29] focus-visible:ring-2 focus-visible:ring-[#ad5034] focus-visible:ring-offset-4"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            <span>Back to works</span>
          </Link>
        </div>
        <section className="grid items-center gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[#e4d6c8] bg-[#f1e5d8] shadow-[0_20px_55px_rgba(65,42,27,0.12)]">
            {artworkUrl ? (
              <Image
                src={artworkUrl}
                alt={`${item.title} artwork`}
                fill
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#f6eadc] via-[#eed9c6] to-[#e8c7af] text-[#9c5b3f]">
                <Music2 aria-hidden="true" className="h-14 w-14 stroke-[1.2]" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">Reverb archive</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#24150f]/20 to-transparent" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  isPublished
                    ? "border-[#d7a58d] bg-[#f5e3d8] text-[#923f29]"
                    : "border-[#e4d6c8] bg-[#f1e5d8] text-[#78685b]"
                }`}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-[#ad5034]" : "bg-[#9b8978]"}`} />
                {isPublished ? "Published work" : item.status}
              </span>
              {result.genreName && (
                <span className="text-sm text-[#85766b]">{result.genreName}</span>
              )}
            </div>

            <h1 className="mt-5 break-words font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-[#2c211c] sm:text-5xl lg:text-[3.5rem]">
              {item.title}
            </h1>
            <p className="mt-3 text-lg text-[#78685b] sm:text-xl">{item.artist}</p>
            {result.projectTitle && (
              <p className="mt-2 text-sm text-[#85766b]">
                From <span className="font-medium text-[#594638]">{result.projectTitle}</span>
              </p>
            )}

            <div className="mt-8 rounded-[22px] border border-[#e4d6c8] bg-[#fffcf7] p-4 shadow-[0_8px_24px_rgba(72,48,29,0.04)] sm:p-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b6a51]">Listen to this work</p>
              {hasAudio ? (
                <audio
                  controls
                  preload="metadata"
                  src={item.audioUrl}
                  aria-label={`Audio player for ${item.title}`}
                  className="w-full accent-[#ad5034]"
                />
              ) : (
                <p className="rounded-xl bg-[#f7f2ea] px-4 py-3 text-sm text-[#78685b]">
                  Audio is not available for this work.
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/works/${item.id}/edit`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#ad5034] px-5 py-2.5 text-sm font-semibold text-white outline-none transition-colors hover:bg-[#923f29] focus-visible:ring-2 focus-visible:ring-[#ad5034] focus-visible:ring-offset-2"
              >
                Edit work
              </Link>
              <form action={async () => { "use server"; await deleteWork(item.id); redirect("/works") }}>
                <ConfirmSubmitButton
                  message="Delete this work permanently? This action cannot be undone."
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9b7a6] bg-[#fffcf7] px-5 py-2.5 text-sm font-medium text-[#923f29] outline-none transition-colors hover:border-[#ad5034] hover:bg-[#f8e9df] focus-visible:ring-2 focus-visible:ring-[#ad5034] focus-visible:ring-offset-2"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Delete work
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        </section>

        <section aria-labelledby="about-work-heading" className="mt-12 rounded-[26px] border border-[#e4d6c8] bg-[#fffcf7] p-5 shadow-[0_10px_35px_rgba(72,48,29,0.045)] sm:mt-16 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-[#eee2d7] pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ad5034]">Archive notes</p>
              <h2 id="about-work-heading" className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">About this work</h2>
            </div>
            <Music2 aria-hidden="true" className="mb-1 hidden h-5 w-5 text-[#c27a5b] sm:block" />
          </div>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <Meta label="Genre" value={result.genreName} />
            <Meta label="Project" value={result.projectTitle} />
            <Meta label="Created" value={item.createdDate} />
            <Meta label="Released" value={item.releasedDate} />
            <Meta label="Version" value={item.version} />
            <Meta label="Composer" value={item.composer} />
            <Meta label="Lyricist" value={item.lyricist} />
            <Meta label="Producer" value={item.producer} />
            <Meta label="Recording" value={item.recording} />
            <Meta label="Format" value={item.format} />
          </div>
        </section>

        <section aria-labelledby="lyrics-heading" className="mt-6 rounded-[26px] border border-[#e4d6c8] bg-[#f3e8dc] p-5 sm:mt-8 sm:p-8">
          <div className="flex items-start gap-4">
            <span aria-hidden="true" className="select-none font-serif text-5xl leading-none text-[#c27a5b]">“</span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ad5034]">Words &amp; notes</p>
              <h2 id="lyrics-heading" className="mt-1 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Lyrics</h2>
              {item.lyrics ? (
                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-[#594638] sm:text-base sm:leading-8">
                  {item.lyrics}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[#78685b]">No lyrics have been added to this work.</p>
              )}
            </div>
          </div>
        </section>
      </div>
      </div>
    </main>
  )
}

function Meta({ label, value }: { label: string; value: string | number | null | undefined }) {
  const displayValue = typeof value === "string" && value.trim() ? value : value || "—"

  return (
    <div className="border-b border-[#eee2d7] py-4 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b6a51]">{label}</p>
      <p className="mt-1.5 break-words text-sm leading-6 text-[#3b2d26]">{displayValue}</p>
    </div>
  )
}
