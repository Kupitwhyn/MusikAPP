import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const updateReturning = vi.fn()
  const updateWhere = vi.fn(() => ({ returning: updateReturning }))
  const updateSet = vi.fn(() => ({ where: updateWhere }))
  const update = vi.fn(() => ({ set: updateSet }))
  const deleteWhere = vi.fn()
  const deleteFrom = vi.fn(() => ({ where: deleteWhere }))
  const tx = { update, delete: deleteFrom }
  const transaction = vi.fn(
    (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
  )
  const requireRole = vi.fn()
  const revalidatePath = vi.fn()

  return {
    deleteWhere,
    revalidatePath,
    requireRole,
    transaction,
    updateReturning,
  }
})

vi.mock("@/lib/db", () => ({ db: { transaction: mocks.transaction } }))
vi.mock("@/lib/session", () => ({ requireRole: mocks.requireRole }))
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))

import { setUserBanned, setUserRole } from "../app/actions/admin"

describe("admin session revocation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireRole.mockResolvedValue({ id: "admin-1", role: "SUPER_ADMIN" })
    mocks.updateReturning.mockResolvedValue([{ id: "target-1" }])
    mocks.deleteWhere.mockResolvedValue([])
  })

  it("updates a user's role and revokes sessions in one transaction", async () => {
    await setUserRole("target-1", "AUDIENCE")

    expect(mocks.transaction).toHaveBeenCalledOnce()
    expect(mocks.updateReturning).toHaveBeenCalledOnce()
    expect(mocks.deleteWhere).toHaveBeenCalledOnce()
  })

  it("revokes sessions when banning or unbanning a user", async () => {
    await setUserBanned("target-1", true)
    await setUserBanned("target-1", false)

    expect(mocks.transaction).toHaveBeenCalledTimes(2)
    expect(mocks.updateReturning).toHaveBeenCalledTimes(2)
    expect(mocks.deleteWhere).toHaveBeenCalledTimes(2)
  })

  it("does not delete sessions when the target user does not exist", async () => {
    mocks.updateReturning.mockResolvedValueOnce([])

    await expect(setUserRole("missing-user", "AUDIENCE")).rejects.toThrow("User not found")

    expect(mocks.transaction).toHaveBeenCalledOnce()
    expect(mocks.deleteWhere).not.toHaveBeenCalled()
  })
})
