import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { SessionUser } from "@/lib/session"
import { normalizeSessionUser } from "@/lib/session"

export async function getMobileUser(request: Request): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: request.headers })
  const baseUser = normalizeSessionUser((session?.user ?? null) as Record<string, unknown> | null)
  if (!baseUser) return null

  const [freshUser] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      banned: user.banned,
    })
    .from(user)
    .where(eq(user.id, baseUser.id))
    .limit(1)

  if (!freshUser || freshUser.banned) return null

  return normalizeSessionUser({
    id: freshUser.id,
    name: freshUser.name,
    email: freshUser.email,
    role: freshUser.role,
    image: freshUser.image,
    banned: freshUser.banned,
  })
}
