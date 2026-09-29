import { hashPassword } from "better-auth/crypto"
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { account, session as authSession, user } from "@/lib/db/schema"

export function hasSuperAdminBootstrapConfig() {
  return Boolean(process.env.SUPER_ADMIN_EMAIL?.trim() && process.env.SUPER_ADMIN_PASSWORD?.trim())
}

export async function ensureSuperAdminBootstrap() {
  if (!hasSuperAdminBootstrapConfig()) return false

  const email = process.env.SUPER_ADMIN_EMAIL!.trim().toLowerCase()
  const password = process.env.SUPER_ADMIN_PASSWORD!.trim()

  const [existing] = await db
    .select({
      id: user.id,
      email: user.email,
      role: user.role,
      banned: user.banned,
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (existing) {
    if (existing.role !== "SUPER_ADMIN" && !existing.banned) {
      await db.transaction(async (tx) => {
        const [updatedUser] = await tx
          .update(user)
          .set({ role: "SUPER_ADMIN", updatedAt: new Date() })
          .where(eq(user.id, existing.id))
          .returning({ id: user.id })
        if (!updatedUser) throw new Error("Bootstrap admin user no longer exists")
        await tx.delete(authSession).where(eq(authSession.userId, existing.id))
      })
    }
    return true
  }

  const now = new Date()
  const id = randomUUID()
  const hashedPassword = await hashPassword(password)

  await db.insert(user).values({
    id,
    name: "System Admin",
    email,
    emailVerified: true,
    image: null,
    role: "SUPER_ADMIN",
    banned: false,
    createdAt: now,
    updatedAt: now,
  })

  await db.insert(account).values({
    id: randomUUID(),
    accountId: id,
    providerId: "credential",
    userId: id,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  })

  return true
}
