import { describe, expect, it } from "vitest"
import { normalizeSessionUser } from "../lib/session"

describe("session validation", () => {
  it("accepts a valid active user from the database", () => {
    expect(
      normalizeSessionUser({
        id: "user-1",
        name: "Rina",
        email: "rina@example.com",
        role: "MUSICIAN",
        banned: false,
      }),
    ).toEqual({
      id: "user-1",
      name: "Rina",
      email: "rina@example.com",
      role: "MUSICIAN",
      image: null,
    })
  })

  it("rejects banned or invalid-role users", () => {
    expect(
      normalizeSessionUser({
        id: "user-2",
        name: "Blocked",
        email: "blocked@example.com",
        role: "MUSICIAN",
        banned: true,
      }),
    ).toBeNull()

    expect(
      normalizeSessionUser({
        id: "user-3",
        name: "Hack",
        email: "hack@example.com",
        role: "ADMIN",
      }),
    ).toBeNull()
  })
})
