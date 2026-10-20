"use server"

import { db } from "@/lib/db"
import { project, work } from "@/lib/db/schema"
import { requireRole } from "@/lib/session"
import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { validateRequiredTitle } from "@/lib/domain-rules"

export type ProjectInput = {
  title: string
  description?: string | null
  artworkUrl?: string | null
  createdDate?: string | null
  releaseDate?: string | null
}

function clean(value?: string | null): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export async function createProject(input: ProjectInput) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const title = validateRequiredTitle(input.title ?? "")
  const [created] = await db
    .insert(project)
    .values({
      userId: user.id,
      title,
      description: clean(input.description),
      artworkUrl: clean(input.artworkUrl),
      createdDate: clean(input.createdDate),
      releaseDate: clean(input.releaseDate),
    })
    .returning({ id: project.id })
  revalidatePath("/projects")
  revalidatePath("/projects/[id]", "page")
  revalidatePath("/dashboard")
  revalidatePath("/admin")
  revalidatePath("/admin/works")
  revalidatePath("/discover")
  revalidatePath("/discover/library")
  revalidatePath("/discover/works/[id]", "page")
  revalidatePath("/discover/musicians/[id]", "page")
  return created.id
}

export async function updateProject(id: number, input: ProjectInput) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const title = validateRequiredTitle(input.title ?? "")
  const [updated] = await db
    .update(project)
    .set({
      title,
      description: clean(input.description),
      artworkUrl: clean(input.artworkUrl),
      createdDate: clean(input.createdDate),
      releaseDate: clean(input.releaseDate),
      updatedAt: new Date(),
    })
    .where(and(eq(project.id, id), eq(project.userId, user.id)))
    .returning({ id: project.id })
  if (!updated) throw new Error("Project was not found or is not owned by this account")
  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
  revalidatePath(`/projects/${id}/edit`)
  revalidatePath("/works")
  revalidatePath("/dashboard")
  revalidatePath("/admin")
  revalidatePath("/admin/works")
  revalidatePath("/discover")
  revalidatePath("/discover/library")
  revalidatePath("/discover/works/[id]", "page")
  revalidatePath("/discover/musicians/[id]", "page")
}

export async function deleteProject(id: number) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [ownedProject] = await db
    .select({ artworkUrl: project.artworkUrl })
    .from(project)
    .where(and(eq(project.id, id), eq(project.userId, user.id)))
    .limit(1)
  if (!ownedProject) throw new Error("Project was not found or is not owned by this account")

  const detachValues = ownedProject.artworkUrl
    ? { projectId: null, artworkUrl: ownedProject.artworkUrl }
    : { projectId: null }
  await db.transaction(async (tx) => {
    await tx.update(work).set(detachValues).where(and(eq(work.projectId, id), eq(work.userId, user.id)))
    await tx.delete(project).where(and(eq(project.id, id), eq(project.userId, user.id)))
  })
  revalidatePath("/projects")
  revalidatePath(`/projects/${id}`)
  revalidatePath("/works")
  revalidatePath("/dashboard")
  revalidatePath("/admin")
  revalidatePath("/admin/works")
  revalidatePath("/discover")
  revalidatePath("/discover/library")
  revalidatePath("/discover/works/[id]", "page")
  revalidatePath("/discover/musicians/[id]", "page")
}

export async function getMyProject(id: number) {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [result] = await db
    .select({
      id: project.id,
      title: project.title,
      description: project.description,
      artworkUrl: project.artworkUrl,
      createdDate: project.createdDate,
      releaseDate: project.releaseDate,
    })
    .from(project)
    .where(and(eq(project.id, id), eq(project.userId, user.id)))
    .limit(1)
  if (!result) return null

  const works = await db
    .select({
      id: work.id,
      title: work.title,
      artist: work.artist,
      status: work.status,
      releasedDate: work.releasedDate,
      artworkUrl: sql<string | null>`coalesce(${project.artworkUrl}, ${work.artworkUrl})`,
    })
    .from(work)
    .leftJoin(project, eq(work.projectId, project.id))
    .where(and(eq(work.projectId, id), eq(work.userId, user.id)))
    .orderBy(desc(work.createdAt))

  return { project: result, works }
}

export async function getMyProjects() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  return db
    .select({
      id: project.id,
      title: project.title,
      description: project.description,
      artworkUrl: project.artworkUrl,
      createdDate: project.createdDate,
      releaseDate: project.releaseDate,
      workCount: sql<number>`count(${work.id})::int`,
    })
    .from(project)
    .leftJoin(work, and(eq(work.projectId, project.id), eq(work.userId, user.id)))
    .where(eq(project.userId, user.id))
    .groupBy(project.id, project.title, project.description, project.artworkUrl, project.createdDate, project.releaseDate, project.createdAt)
    .orderBy(desc(project.createdAt))
}

export async function getMyProjectsSimple() {
  const user = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  return db
    .select({ id: project.id, title: project.title, artworkUrl: project.artworkUrl })
    .from(project)
    .where(eq(project.userId, user.id))
    .orderBy(desc(project.createdAt))
}
