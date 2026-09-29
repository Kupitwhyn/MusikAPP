import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { favorite, work } from "@/lib/db/schema"
import { getMobileUser } from "@/lib/mobile-auth"
import { and, eq } from "drizzle-orm"

export async function POST(request: Request) {
  const user = await getMobileUser(request)
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  if (user.role !== "AUDIENCE") return NextResponse.json({ error: "Audience account required" }, { status: 403 })

  const body = (await request.json().catch(() => null)) as { workId?: unknown } | null
  const workId = typeof body?.workId === "number" && Number.isInteger(body.workId) ? body.workId : null
  if (!workId) return NextResponse.json({ error: "workId must be an integer" }, { status: 400 })

  const [publishedWork] = await db
    .select({ id: work.id })
    .from(work)
    .where(and(eq(work.id, workId), eq(work.status, "PUBLISHED")))
    .limit(1)
  if (!publishedWork) return NextResponse.json({ error: "This work is not available" }, { status: 404 })

  const [existing] = await db
    .select({ id: favorite.id })
    .from(favorite)
    .where(and(eq(favorite.userId, user.id), eq(favorite.workId, workId)))
    .limit(1)

  if (existing) {
    await db.delete(favorite).where(eq(favorite.id, existing.id))
    return NextResponse.json({ data: { workId, favorited: false } })
  }

  await db.insert(favorite).values({ userId: user.id, workId })
  return NextResponse.json({ data: { workId, favorited: true } }, { status: 201 })
}

export async function GET(request: Request) {
  const user = await getMobileUser(request)
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  if (user.role !== "AUDIENCE") return NextResponse.json({ error: "Audience account required" }, { status: 403 })
  const workId = Number(new URL(request.url).searchParams.get("workId"))
  if (!Number.isInteger(workId) || workId < 1) {
    return NextResponse.json({ error: "workId must be an integer" }, { status: 400 })
  }
  const [existing] = await db
    .select({ id: favorite.id })
    .from(favorite)
    .where(and(eq(favorite.userId, user.id), eq(favorite.workId, workId)))
    .limit(1)
  return NextResponse.json({ data: { workId, favorited: Boolean(existing) } })
}
