"use server"

import { db } from "@/lib/db"
import { work, genre, musicianProfile, user, favorite, report, project } from "@/lib/db/schema"
import { getSessionUser, requireUser } from "@/lib/session"
import { and, desc, eq, sql, ilike, or } from "drizzle-orm"
import { hasOpenReportForReporter, canReportWork } from "@/lib/domain-rules"

const PUBLISHED = eq(work.status, "PUBLISHED")

export type PublicWork = {
  id: number
  title: string
  artist: string
  artworkUrl: string | null
  audioUrl: string
  duration: number | null
  genreName: string | null
  projectTitle: string | null
  musicianName: string | null
  musicianId: string
}

const publicWorkColumns = {
  id: work.id,
  title: work.title,
  artist: work.artist,
  artworkUrl: sql<string | null>`coalesce(${project.artworkUrl}, ${work.artworkUrl})`,
  audioUrl: work.audioUrl,
  duration: work.duration,
  genreName: genre.name,
  projectTitle: project.title,
  musicianName: musicianProfile.displayName,
  musicianId: work.userId,
}

export async function getFeaturedWorks(limit = 12) {
  return db
    .select(publicWorkColumns)
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .leftJoin(musicianProfile, eq(work.userId, musicianProfile.userId))
    .where(PUBLISHED)
    .orderBy(desc(work.createdAt))
    .limit(limit)
}

export async function getPopularWorks(limit = 12) {
  return db
    .select(publicWorkColumns)
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .leftJoin(musicianProfile, eq(work.userId, musicianProfile.userId))
    .where(PUBLISHED)
    .orderBy(desc(work.playCount), desc(work.createdAt))
    .limit(limit)
}

export async function getGenres() {
  return db.select({ id: genre.id, name: genre.name, slug: genre.slug }).from(genre).orderBy(genre.name)
}

export async function searchWorks(query: string, genreId?: number) {
  const conditions = [PUBLISHED]
  if (query?.trim()) {
    conditions.push(
      or(
        ilike(work.title, `%${query}%`),
        ilike(work.artist, `%${query}%`),
        ilike(musicianProfile.displayName, `%${query}%`),
        ilike(project.title, `%${query}%`),
      )!,
    )
  }
  if (genreId) conditions.push(eq(work.genreId, genreId))

  return db
    .select(publicWorkColumns)
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .leftJoin(musicianProfile, eq(work.userId, musicianProfile.userId))
    .where(and(...conditions))
    .orderBy(desc(work.createdAt))
    .limit(50)
}

export async function getWorkDetail(id: number) {
  const [row] = await db
    .select({
      id: work.id,
      title: work.title,
      artist: work.artist,
      artworkUrl: sql<string | null>`coalesce(${project.artworkUrl}, ${work.artworkUrl})`,
      audioUrl: work.audioUrl,
      duration: work.duration,
      composer: work.composer,
      lyricist: work.lyricist,
      producer: work.producer,
      recording: work.recording,
      version: work.version,
      lyrics: work.lyrics,
      releasedDate: work.releasedDate,
      createdDate: work.createdDate,
      format: work.format,
      genreName: genre.name,
      projectTitle: project.title,
      musicianId: work.userId,
      musicianName: musicianProfile.displayName,
      musicianImage: musicianProfile.imageUrl,
    })
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .leftJoin(musicianProfile, eq(work.userId, musicianProfile.userId))
    .where(and(eq(work.id, id), PUBLISHED))
    .limit(1)
  return row ?? null
}

export async function getMusicianPublicProfile(musicianId: string) {
  const [profile] = await db
    .select({
      userId: musicianProfile.userId,
      displayName: musicianProfile.displayName,
      bio: musicianProfile.bio,
      primaryGenre: musicianProfile.primaryGenre,
      imageUrl: musicianProfile.imageUrl,
      accountName: user.name,
    })
    .from(user)
    .leftJoin(musicianProfile, eq(user.id, musicianProfile.userId))
    .where(eq(user.id, musicianId))
    .limit(1)

  if (!profile) return null

  const works = await db
    .select(publicWorkColumns)
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .leftJoin(musicianProfile, eq(work.userId, musicianProfile.userId))
    .where(and(eq(work.userId, musicianId), PUBLISHED))
    .orderBy(desc(work.createdAt))

  return { profile, works }
}

export async function incrementPlayCount(workId: number) {
  await db
    .update(work)
    .set({ playCount: sql`${work.playCount} + 1` })
    .where(and(eq(work.id, workId), PUBLISHED))
}

export async function submitReport(workId: number, reason: string, details?: string) {
  const u = await getSessionUser()
  if (!canReportWork("PUBLISHED", reason ?? "")) throw new Error("Reason is required")
  const [publishedWork] = await db
    .select({ id: work.id, userId: work.userId })
    .from(work)
    .where(and(eq(work.id, workId), PUBLISHED))
    .limit(1)
  if (!publishedWork) throw new Error("This work is not available for reporting")
  if (u?.id === publishedWork.userId) throw new Error("You cannot report your own work")
  if (u) {
    const [existingReport] = await db
      .select({ id: report.id, workId: report.workId, reporterId: report.reporterId, status: report.status })
      .from(report)
      .where(and(eq(report.workId, workId), eq(report.reporterId, u.id), eq(report.status, "OPEN")))
      .limit(1)
    if (existingReport && hasOpenReportForReporter([existingReport], workId, u.id)) throw new Error("You already reported this work")
  }
  await db.insert(report).values({
    workId,
    reporterId: u?.id ?? null,
    reason: reason.trim(),
    details: details?.trim() || null,
  })
  return { ok: true }
}
