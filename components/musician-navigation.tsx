import Image from "next/image"
import Link from "next/link"
import {
  AudioLines,
  Compass,
  FolderKanban,
  Heart,
  LayoutDashboard,
  LogOut,
  Music2,
  Plus,
  UserRound,
  type LucideIcon,
} from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"

const navigation: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/works", label: "Works", icon: Music2 },
  { href: "/works/new", label: "Add work", icon: Plus },
  { href: "/discover/library", label: "Library", icon: Heart },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/discover", label: "Discover", icon: Compass },
]

type MusicianNavigationProps = {
  activeHref: string
  name: string
  roleLabel: string
  imageUrl: string | null
}

export function MusicianNavigation({ activeHref, name, roleLabel, imageUrl }: MusicianNavigationProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-16 shrink-0 flex-col border-r border-[#e4d8c9] bg-[#f4eee4] px-2 py-4 md:w-56 md:px-4 md:py-7 lg:w-60">
        <Link href="/dashboard" aria-label="Reverb dashboard" className="mb-7 flex h-10 items-center justify-center px-1 font-serif text-2xl font-semibold tracking-tight md:mb-10 md:justify-start md:px-3 md:text-3xl">
          <span className="md:hidden">R</span>
          <span className="hidden md:inline">Reverb</span>
        </Link>

        <Link href="/profile" aria-label={`Open profile for ${name}`} className="mb-6 flex items-center justify-center gap-3 rounded-2xl px-1 py-2 transition-colors hover:bg-white/70 md:mb-8 md:justify-start md:px-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ead4c0] font-serif text-lg font-semibold text-[#813f2f]">
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill unoptimized sizes="44px" className="object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>
        </Link>

        <nav aria-label="Musician navigation" className="space-y-1">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = href === activeHref
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={label}
                className={`flex items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm transition-colors md:justify-start md:px-3 ${
                  active
                    ? "bg-[#f0dfce] font-semibold text-[#963f22]"
                    : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                }`}
              >
                <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
                <span className="sr-only md:not-sr-only">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-[#e4d8c9] px-1 pt-4 md:px-3 md:pt-6">
          <div className="relative flex h-10 w-10 items-center justify-center md:h-auto md:w-auto md:justify-start md:gap-3">
            <LogOut aria-hidden="true" className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.8} />
            <SignOutButton ariaLabel="Sign out" className="absolute inset-0 h-full w-full opacity-0 md:static md:h-auto md:w-auto md:opacity-100" />
          </div>
          <div className="mt-12 hidden text-[#ae704c] md:block">
            <AudioLines aria-hidden="true" className="mb-3 h-5 w-5" />
            <p className="max-w-32 text-sm leading-5">More music,<br />more stories.</p>
          </div>
        </div>
      </aside>
  )
}
