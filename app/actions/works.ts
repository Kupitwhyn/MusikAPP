"use server"

import { db } from "@/lib/db"
import { work, project, genre } from "@/lib/db/schema"
import { requireRole } from "@/lib/session"
import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { validateRequiredWorkFields } from "@/lib/domain-rules"

export type WorkInput = {
  title: string
  artist: string
  genreId?: number | null
  projectId?: number | null
  createdDate?: string | null
  releasedDate?: string | null
  duration?: number | null
  composer?: string | null
  lyricist?: string | null
  producer?: string | null
  recording?: string | null
  version?: string | null
  audioUrl: string
  artworkUrl?: string | null
  lyrics?: string | null
  fileSize?: number | null
  format?: string | null
}

function clean(value?: string | null): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export async function createWork(input: WorkInput) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])

  validateRequiredWorkFields(input)
  if (input.genreId != null) {
    const [selectedGenre] = await db.select({ id: genre.id }).from(genre).where(eq(genre.id, input.genreId)).limit(1)
    if (!selectedGenre) throw new Error("Selected genre was not found")
  }
  if (input.projectId != null) {
    const [selectedProject] = await db
      .select({ id: project.id })
      .from(project)
      .where(and(eq(project.id, input.projectId), eq(project.userId, user.id)))
      .limit(1)
    if (!selectedProject) throw new Error("Selected project does not belong to this account")
  }

  const [created] = await db
    .insert(work)
    .values({
      userId: user.id,
      title: input.title.trim(),
      artist: input.artist.trim(),
      genreId: input.genreId ?? null,
      projectId: input.projectId ?? null,
      createdDate: clean(input.createdDate),
      releasedDate: clean(input.releasedDate),
      duration: input.duration ?? null,
      composer: clean(input.composer),
      lyricist: clean(input.lyricist),
      producer: clean(input.producer),
      recording: clean(input.recording),
      version: clean(input.version),
      audioUrl: input.audioUrl,
      artworkUrl: clean(input.artworkUrl),
      lyrics: clean(input.lyrics),
      fileSize: input.fileSize ?? null,
      format: clean(input.format),
      status: "PUBLISHED",
    })
    .returning({ id: work.id })

  revalidatePath("/works")
  revalidatePath("/dashboard")
  revalidatePath("/admin/genres")
  return created.id
}

export async function updateWork(id: number, input: WorkInput) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  validateRequiredWorkFields(input)
  if (input.genreId != null) {
    const [selectedGenre] = await db
      .select({ id: genre.id })
      .from(genre)
      .where(eq(genre.id, input.genreId))
      .limit(1)
    if (!selectedGenre) throw new Error("Selected genre was not found")
  }
  if (input.projectId != null) {
    const [selectedProject] = await db
      .select({ id: project.id })
      .from(project)
      .where(and(eq(project.id, input.projectId), eq(project.userId, user.id)))
      .limit(1)
    if (!selectedProject) throw new Error("Selected project does not belong to this account")
  }

  const [updated] = await db
    .update(work)
    .set({
      title: input.title.trim(),
      artist: input.artist.trim(),
      genreId: input.genreId ?? null,
      projectId: input.projectId ?? null,
      createdDate: clean(input.createdDate),
      releasedDate: clean(input.releasedDate),
      duration: input.duration ?? null,
      composer: clean(input.composer),
      lyricist: clean(input.lyricist),
      producer: clean(input.producer),
      recording: clean(input.recording),
      version: clean(input.version),
      audioUrl: input.audioUrl,
      artworkUrl: clean(input.artworkUrl),
      lyrics: clean(input.lyrics),
      fileSize: input.fileSize ?? null,
      format: clean(input.format),
      updatedAt: new Date(),
    })
    .where(and(eq(work.id, id), eq(work.userId, user.id)))
    .returning({ id: work.id, genreId: work.genreId })

  if (!updated) throw new Error("Work was not found or is not owned by this account")
  if (updated.genreId !== (input.genreId ?? null)) {
    throw new Error("Work genre was not updated")
  }

  revalidatePath("/works")
  revalidatePath(`/works/${id}`)
  revalidatePath("/dashboard")
  revalidatePath("/discover")
  revalidatePath("/admin/genres", "page")
}

export async function deleteWork(id: number) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  await db.delete(work).where(and(eq(work.id, id), eq(work.userId, user.id)))
  revalidatePath("/works")
  revalidatePath("/dashboard")
  revalidatePath("/discover")
  revalidatePath("/admin/genres")
}

export async function getMyWorks() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  return db
    .select({
      id: work.id,
      title: work.title,
      artist: work.artist,
      artworkUrl: work.artworkUrl,
      version: work.version,
      releasedDate: work.releasedDate,
      duration: work.duration,
      genreName: genre.name,
      projectTitle: project.title,
      createdAt: work.createdAt,
    })
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .where(eq(work.userId, user.id))
    .orderBy(desc(work.createdAt))
}

export async function getMyWork(id: number) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [row] = await db
    .select({
      work: work,
      genreName: genre.name,
      projectTitle: project.title,
    })
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .where(and(eq(work.id, id), eq(work.userId, user.id)))
    .limit(1)
  return row ?? null
}

export async function getMyStats() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [works] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(work)
    .where(eq(work.userId, user.id))
  const [projects] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(project)
    .where(eq(project.userId, user.id))
  return {
    totalWorks: works?.count ?? 0,
    totalProjects: projects?.count ?? 0,
  }
}
