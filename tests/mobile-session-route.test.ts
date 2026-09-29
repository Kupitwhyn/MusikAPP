import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getFreshSessionUserById: vi.fn(),
}))

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}))
vi.mock("@/lib/session", () => ({
  getFreshSessionUserById: mocks.getFreshSessionUserById,
}))

import { GET } from "../app/api/v1/session/route"

describe("mobile session route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getSession.mockResolvedValue({
      session: { id: "session-1", expiresAt: new Date("2026-10-01T00:00:00.000Z") },
      user: { id: "audience-1" },
    })
  })

  it("returns the fresh audience user and active session", async () => {
    mocks.getFreshSessionUserById.mockResolvedValue({
      id: "audience-1",
      name: "Listener",
      email: "listener@example.test",
      role: "AUDIENCE",
      image: null,
    })

    const response = await GET(new Request("http://localhost/api/v1/session"))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.data.user.role).toBe("AUDIENCE")
    expect(payload.data.session.id).toBe("session-1")
    expect(mocks.getFreshSessionUserById).toHaveBeenCalledWith("audience-1")
  })

  it("rejects requests without an active session", async () => {
    mocks.getSession.mockResolvedValue(null)

    const response = await GET(new Request("http://localhost/api/v1/session"))

    expect(response.status).toBe(401)
    expect(mocks.getFreshSessionUserById).not.toHaveBeenCalled()
  })

  it("rejects valid sessions for non-audience roles", async () => {
    mocks.getFreshSessionUserById.mockResolvedValue({
      id: "musician-1",
      name: "Musician",
      email: "musician@example.test",
      role: "MUSICIAN",
      image: null,
    })

    const response = await GET(new Request("http://localhost/api/v1/session"))

    expect(response.status).toBe(403)
  })

  it("rejects sessions whose user is banned or no longer exists", async () => {
    mocks.getFreshSessionUserById.mockResolvedValue(null)

    const response = await GET(new Request("http://localhost/api/v1/session"))

    expect(response.status).toBe(401)
  })
})
