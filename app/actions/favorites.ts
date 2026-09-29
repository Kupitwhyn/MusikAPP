"use server"

import { db } from "@/lib/db"
import { favorite, work, genre, musicianProfile } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { canCreateFavorite } from "@/lib/domain-rules"

export async function toggleFavorite(workId: number) {
  const u = await requireUser()
  const [publishedWork] = await db
    .select({ id: work.id, status: work.status })
    .from(work)
    .where(and(eq(work.id, workId), eq(work.status, "PUBLISHED")))
    .limit(1)
  if (!publishedWork || !canCreateFavorite(publishedWork.status)) throw new Error("This work is not available")
  const [existing] = await db
    .select({ id: favorite.id })
    .from(favorite)
    .where(and(eq(favorite.userId, u.id), eq(favorite.workId, workId)))
    .limit(1)

  if (existing) {
    await db.delete(favorite).where(eq(favorite.id, existing.id))
    revalidatePath("/discover/library")
    revalidatePath(`/discover/works/${workId}`)
    return { favorited: false }
  }

  await db.insert(favorite).values({ userId: u.id, workId })
  revalidatePath("/discover/library")
  revalidatePath(`/discover/works/${workId}`)
  return { favorited: true }
}

export async function getMyFavoriteIds() {
  const u = await requireUser()
  const rows = await db
    .select({ workId: favorite.workId })
    .from(favorite)
    .where(eq(favorite.userId, u.id))
  return rows.map((r) => r.workId)
}

export async function getMyFavorites() {
  const u = await requireUser()
  return db
    .select({
      id: work.id,
      title: work.title,
      artist: work.artist,
      artworkUrl: work.artworkUrl,
      duration: work.duration,
      audioUrl: work.audioUrl,
      genreName: genre.name,
      musicianName: musicianProfile.displayName,
    })
    .from(favorite)
    .innerJoin(work, eq(favorite.workId, work.id))
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(musicianProfile, eq(work.userId, musicianProfile.userId))
    .where(and(eq(favorite.userId, u.id), eq(work.status, "PUBLISHED")))
    .orderBy(desc(favorite.createdAt))
}
