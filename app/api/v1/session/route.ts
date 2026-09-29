import { auth } from "@/lib/auth"
import { getFreshSessionUserById } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const currentSession = await auth.api.getSession({ headers: request.headers })
  if (!currentSession) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const currentUser = await getFreshSessionUserById(currentSession.user.id)
  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  if (currentUser.role !== "AUDIENCE") {
    return NextResponse.json({ error: "Audience account required" }, { status: 403 })
  }

  return NextResponse.json({
    data: {
      session: currentSession.session,
      user: currentUser,
    },
  })
}
