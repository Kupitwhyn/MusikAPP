import { del, put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { getMobileUser } from "@/lib/mobile-auth"
import { eq } from "drizzle-orm"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export async function PATCH(request: Request) {
  const currentUser = await getMobileUser(request)
  if (!currentUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  if (currentUser.role !== "AUDIENCE") return NextResponse.json({ error: "Audience account required" }, { status: 403 })
  let body: { base64?: string; mimeType?: string }
  try {
    body = await request.json() as { base64?: string; mimeType?: string }
  } catch {
    return NextResponse.json({ error: "The selected image could not be read. Please try again." }, { status: 400 })
  }
  if (!body.base64 || !body.mimeType) return NextResponse.json({ error: "Profile image is required" }, { status: 400 })
  if (!ALLOWED_TYPES.has(body.mimeType)) return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image" }, { status: 400 })
  const image = Buffer.from(body.base64, "base64")
  if (image.byteLength > MAX_IMAGE_SIZE) return NextResponse.json({ error: "Profile image must be 5 MB or smaller" }, { status: 400 })
  const blob = await put(`audience-profiles/${currentUser.id}-${Date.now()}`, image, { access: "public", addRandomSuffix: true, contentType: body.mimeType })
  await db.update(user).set({ image: blob.url, updatedAt: new Date() }).where(eq(user.id, currentUser.id))
  return NextResponse.json({ data: { image: blob.url } })
}

export async function DELETE(request: Request) {
  const currentUser = await getMobileUser(request)
  if (!currentUser) return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  if (currentUser.role !== "AUDIENCE") return NextResponse.json({ error: "Audience account required" }, { status: 403 })
  const [account] = await db.select({ image: user.image }).from(user).where(eq(user.id, currentUser.id)).limit(1)
  if (account?.image) await del(account.image)
  await db.update(user).set({ image: null, updatedAt: new Date() }).where(eq(user.id, currentUser.id))
  return NextResponse.json({ data: { image: null } })
}
