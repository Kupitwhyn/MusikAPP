import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionUser, getProtectedRouteRedirect } from "@/lib/session"

const PUBLIC_PATHS = new Set(["/", "/sign-in", "/sign-up", "/discover", "/api/auth", "/api/v1/works", "/api/v1/works/"])

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = Array.from(PUBLIC_PATHS).some((path) => pathname === path || pathname.startsWith(`${path}/`))
  if (isPublic) return NextResponse.next()

  if (pathname.startsWith("/api/")) return NextResponse.next()

  return getSessionUser().then((user) => {
    const redirectPath = getProtectedRouteRedirect(pathname, user?.role ?? null)
    if (!redirectPath) return NextResponse.next()
    return NextResponse.redirect(new URL(redirectPath, request.url))
  })
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/projects/:path*",
    "/works/:path*",
    "/profile",
    "/discover/library",
    "/discover/library/:path*",
  ],
}
