"use server"

import { db } from "@/lib/db"
import { user, work, genre, project, report, musicianProfile, favorite, session as authSession } from "@/lib/db/schema"
import { requireRole } from "@/lib/session"
import { and, desc, eq, sql, ilike, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function getAdminStats() {
  await requireRole(["SUPER_ADMIN"])
  const [users] = await db.select({ c: sql<number>`count(*)::int` }).from(user)
  const [musicians] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(user)
    .where(eq(user.role, "MUSICIAN"))
  const [audiences] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(user)
    .where(eq(user.role, "AUDIENCE"))
  const [works] = await db.select({ c: sql<number>`count(*)::int` }).from(work)
  const [projects] = await db.select({ c: sql<number>`count(*)::int` }).from(project)
  const [genres] = await db.select({ c: sql<number>`count(*)::int` }).from(genre)
  const [reports] = await db.select({ c: sql<number>`count(*)::int` }).from(report)
  const [openReports] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(report)
    .where(eq(report.status, "OPEN"))
  return {
    totalUsers: users?.c ?? 0,
    totalMusicians: musicians?.c ?? 0,
    totalAudiences: audiences?.c ?? 0,
    totalWorks: works?.c ?? 0,
    totalProjects: projects?.c ?? 0,
    totalGenres: genres?.c ?? 0,
    totalReports: reports?.c ?? 0,
    openReports: openReports?.c ?? 0,
  }
}

export async function getRecentAdminWorks(limit = 4) {
  await requireRole(["SUPER_ADMIN"])
  return db
    .select({
      id: work.id,
      title: work.title,
      artist: work.artist,
      artworkUrl: sql<string | null>`coalesce(${project.artworkUrl}, ${work.artworkUrl})`,
      status: work.status,
      genreName: genre.name,
      ownerName: user.name,
      createdAt: work.createdAt,
    })
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .leftJoin(user, eq(work.userId, user.id))
    .orderBy(desc(work.createdAt))
    .limit(limit)
}

export async function getRecentReports(limit = 3) {
  await requireRole(["SUPER_ADMIN"])
  return db
    .select({
      id: report.id,
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
      workId: report.workId,
      workTitle: work.title,
      workArtist: work.artist,
    })
    .from(report)
    .leftJoin(work, eq(report.workId, work.id))
    .orderBy(desc(report.createdAt))
    .limit(limit)
}

export async function getAllUsers(query?: string, roleFilter?: string) {
  await requireRole(["SUPER_ADMIN"])
  const base = db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
  const filters = []
  if (query?.trim()) filters.push(or(ilike(user.name, `%${query}%`), ilike(user.email, `%${query}%`))!)
  if (roleFilter && ["SUPER_ADMIN", "MUSICIAN", "AUDIENCE"].includes(roleFilter)) filters.push(eq(user.role, roleFilter))
  return (filters.length ? base.where(and(...filters)) : base).orderBy(desc(user.createdAt))
}

export async function setUserRole(userId: string, role: string) {
  const admin = await requireRole(["SUPER_ADMIN"])
  if (userId === admin.id) throw new Error("You cannot change your own role")
  if (!["SUPER_ADMIN", "MUSICIAN", "AUDIENCE"].includes(role)) throw new Error("Invalid role")
  await db.transaction(async (tx) => {
    const [updatedUser] = await tx
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning({ id: user.id })
    if (!updatedUser) throw new Error("User not found")
    await tx.delete(authSession).where(eq(authSession.userId, userId))
  })
  revalidatePath("/admin/users")
}

export async function setUserBanned(userId: string, banned: boolean) {
  const admin = await requireRole(["SUPER_ADMIN"])
  if (userId === admin.id) throw new Error("You cannot ban yourself")
  await db.transaction(async (tx) => {
    const [updatedUser] = await tx
      .update(user)
      .set({ banned, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning({ id: user.id })
    if (!updatedUser) throw new Error("User not found")
    await tx.delete(authSession).where(eq(authSession.userId, userId))
  })
  revalidatePath("/admin/users")
}

export async function getAllMusicians() {
  await requireRole(["SUPER_ADMIN"])
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      banned: user.banned,
      displayName: musicianProfile.displayName,
      primaryGenre: musicianProfile.primaryGenre,
      imageUrl: musicianProfile.imageUrl,
      workCount: sql<number>`(select count(*)::int from ${work} where ${work.userId} = ${user.id})`,
    })
    .from(user)
    .leftJoin(musicianProfile, eq(user.id, musicianProfile.userId))
    .where(eq(user.role, "MUSICIAN"))
    .orderBy(desc(user.createdAt))
}

export async function getAllWorks(query?: string) {
  await requireRole(["SUPER_ADMIN"])
  const base = db
    .select({
      id: work.id,
      title: work.title,
      artist: work.artist,
      artworkUrl: sql<string | null>`coalesce(${project.artworkUrl}, ${work.artworkUrl})`,
      status: work.status,
      duration: work.duration,
      audioUrl: work.audioUrl,
      genreName: genre.name,
      ownerName: user.name,
      createdAt: work.createdAt,
    })
    .from(work)
    .leftJoin(genre, eq(work.genreId, genre.id))
    .leftJoin(project, eq(work.projectId, project.id))
    .leftJoin(user, eq(work.userId, user.id))
  if (query?.trim()) {
    return base
      .where(or(ilike(work.title, `%${query}%`), ilike(work.artist, `%${query}%`)))
      .orderBy(desc(work.createdAt))
  }
  return base.orderBy(desc(work.createdAt))
}

export async function setWorkStatus(workId: number, status: string) {
  await requireRole(["SUPER_ADMIN"])
  await db.update(work).set({ status, updatedAt: new Date() }).where(eq(work.id, workId))
  revalidatePath("/admin/works")
}

export async function adminDeleteWork(workId: number) {
  await requireRole(["SUPER_ADMIN"])
  await db.delete(favorite).where(eq(favorite.workId, workId))
  await db.delete(report).where(eq(report.workId, workId))
  await db.delete(work).where(eq(work.id, workId))
  revalidatePath("/admin/works")
  revalidatePath("/admin/genres")
}

// -------------------------- Genres --------------------------

export async function getGenresWithCounts() {
  await requireRole(["SUPER_ADMIN"])
  return db
    .select({
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
      workCount: sql<number>`count(${work.id})::int`,
    })
    .from(genre)
    .leftJoin(work, eq(work.genreId, genre.id))
    .groupBy(genre.id, genre.name, genre.slug)
    .orderBy(genre.name)
}

export async function createGenre(name: string) {
  await requireRole(["SUPER_ADMIN"])
  if (!name?.trim()) throw new Error("Name is required")
  await db
    .insert(genre)
    .values({ name: name.trim(), slug: slugify(name) })
    .onConflictDoNothing()
  revalidatePath("/admin/genres")
}

export async function deleteGenre(id: number) {
  await requireRole(["SUPER_ADMIN"])
  await db.update(work).set({ genreId: null }).where(eq(work.genreId, id))
  await db.delete(genre).where(eq(genre.id, id))
  revalidatePath("/admin/genres")
}

// -------------------------- Reports --------------------------

export async function getReports() {
  await requireRole(["SUPER_ADMIN"])
  return db
    .select({
      id: report.id,
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
      workId: report.workId,
      workTitle: work.title,
      workArtist: work.artist,
    })
    .from(report)
    .leftJoin(work, eq(report.workId, work.id))
    .orderBy(desc(report.createdAt))
}

export async function resolveReport(id: number) {
  await requireRole(["SUPER_ADMIN"])
  await db.update(report).set({ status: "RESOLVED", updatedAt: new Date() }).where(eq(report.id, id))
  revalidatePath("/admin/reports")
}

export async function hideReportedWork(reportId: number) {
  await requireRole(["SUPER_ADMIN"])
  const [reported] = await db
    .select({ workId: report.workId })
    .from(report)
    .where(eq(report.id, reportId))
    .limit(1)
  if (!reported) throw new Error("Report not found")
  await db.update(work).set({ status: "HIDDEN", updatedAt: new Date() }).where(eq(work.id, reported.workId))
  await db.update(report).set({ status: "RESOLVED", updatedAt: new Date() }).where(eq(report.id, reportId))
  revalidatePath("/admin/reports")
  revalidatePath("/admin/works")
  revalidatePath("/discover")
  revalidatePath(`/discover/works/${reported.workId}`)
}
