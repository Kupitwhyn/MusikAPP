"use server"

import { db } from "@/lib/db"
import { musicianProfile, user } from "@/lib/db/schema"
import { requireRole, requireUser } from "@/lib/session"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type ProfileInput = {
  displayName: string
  bio?: string | null
  primaryGenre?: string | null
  imageUrl?: string | null
}

function clean(value?: string | null): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export async function getMyProfile() {
  const u = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  const [row] = await db
    .select()
    .from(musicianProfile)
    .where(eq(musicianProfile.userId, u.id))
    .limit(1)
  return { profile: row ?? null, account: u }
}

export async function saveMyProfile(input: ProfileInput) {
  const u = await requireRole(["MUSICIAN", "SUPER_ADMIN"])
  if (!input.displayName?.trim()) throw new Error("Display name is required")

  const [existing] = await db
    .select({ id: musicianProfile.id })
    .from(musicianProfile)
    .where(eq(musicianProfile.userId, u.id))
    .limit(1)

  if (existing) {
    await db
      .update(musicianProfile)
      .set({
        displayName: input.displayName.trim(),
        bio: clean(input.bio),
        primaryGenre: clean(input.primaryGenre),
        imageUrl: clean(input.imageUrl),
        updatedAt: new Date(),
      })
      .where(eq(musicianProfile.userId, u.id))
  } else {
    await db.insert(musicianProfile).values({
      userId: u.id,
      displayName: input.displayName.trim(),
      bio: clean(input.bio),
      primaryGenre: clean(input.primaryGenre),
      imageUrl: clean(input.imageUrl),
    })
  }

  // Keep the account display name in sync.
  await db
    .update(user)
    .set({ name: input.displayName.trim(), updatedAt: new Date() })
    .where(eq(user.id, u.id))

  revalidatePath("/profile")
}
