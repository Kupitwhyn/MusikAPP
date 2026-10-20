import { MusicianNavigation } from "@/components/musician-navigation"
import { getMyProfile } from "@/app/actions/profile"
import { requireRole } from "@/lib/session"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const { profile, account } = await getMyProfile()
  const initial = {
    displayName: profile?.displayName ?? account.name,
    bio: profile?.bio ?? null,
    primaryGenre: profile?.primaryGenre ?? null,
    imageUrl: profile?.imageUrl ?? account.image ?? null,
  }
  const roleLabel = user.role === "SUPER_ADMIN" ? "Super admin" : "Musician"

  return (
    <main className="flex min-h-svh bg-[#f8f4ed] text-[#30251e]">
      <MusicianNavigation activeHref="/profile" name={user.name} roleLabel={roleLabel} imageUrl={initial.imageUrl} />
      <div className="ml-16 min-w-0 flex-1 md:ml-56 lg:ml-60">
        <div className="mx-auto w-full max-w-[1200px] px-5 py-6 sm:px-8 sm:py-8 xl:px-11">
          <header className="mb-6 rounded-[26px] border border-[#ead8c5] bg-gradient-to-br from-[#fbf5eb] via-[#f5e7d8] to-[#eddbc8] px-6 py-7 sm:px-9 sm:py-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a64c2a]">Musician profile</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#30251e] sm:text-4xl">Your profile</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6257] sm:text-base">
              This identity appears alongside your published archive.
            </p>
          </header>
          <section className="rounded-[26px] border border-[#e9dac8] bg-[#fffdf8] p-5 shadow-[0_10px_35px_rgba(72,48,29,0.05)] sm:p-7 xl:p-8">
            <ProfileForm initial={initial} />
          </section>
        </div>
      </div>
    </main>
  )
}
