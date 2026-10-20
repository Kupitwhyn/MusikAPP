import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { favorite, genre, musicianProfile, project, work } from "@/lib/db/schema"
import { getMobileUser } from "@/lib/mobile-auth"
import { and, desc, eq, sql } from "drizzle-orm"

export async function GET(request: Request) {
  const user = await getMobileUser(request)
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  if (user.role !== "AUDIENCE") return NextResponse.json({ error: "Audience account required" }, { status: 403 })

  const data = await db
    .select({
      id: work.id,
      title: work.title,
      artist: work.artist,
      artworkUrl: sql<string | null>`coalesce(${project.artworkUrl}, ${work.artworkUrl})`,
      audioUrl: work.audioUrl,
      duration: work.duration,
      genreName: genre.name,
      musicianName: musicianProfile.displayName,
      musicianId: work.userId,
    })
    .from(favorite)
    .innerJoin(work, eq(favorite.workId, work.id))
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .leftJoin(musicianProfile, eq(work.userId, musicianProfile.userId))
    .where(and(eq(favorite.userId, user.id), eq(work.status, "PUBLISHED")))
    .orderBy(desc(favorite.createdAt))

  return NextResponse.json({ data })
}
