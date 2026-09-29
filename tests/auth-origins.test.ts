import { describe, expect, it } from "vitest"
import { getAuthTrustedOrigins } from "../lib/auth-origins"

describe("auth trusted origins", () => {
  it("includes the configured app, mobile web, and additional exact origins", () => {
    expect(
      getAuthTrustedOrigins({
        baseUrl: "https://staging.example.com",
        nodeEnv: "production",
        mobileWebOrigin: "https://mobile.example.com",
        trustedOrigins: "https://preview.example.com, https://mobile.example.com",
      }),
    ).toEqual([
      "https://staging.example.com",
      "https://mobile.example.com",
      "https://preview.example.com",
    ])
  })

  it("rejects insecure or non-origin production trusted origins", () => {
    expect(() =>
      getAuthTrustedOrigins({
        baseUrl: "https://staging.example.com",
        nodeEnv: "production",
        trustedOrigins: "http://preview.example.com",
      }),
    ).toThrow("must use HTTPS in production")

    expect(() =>
      getAuthTrustedOrigins({
        baseUrl: "https://staging.example.com",
        nodeEnv: "production",
        trustedOrigins: "https://preview.example.com/path",
      }),
    ).toThrow("must be an origin")
  })

  it("keeps local development origins but excludes them in production", () => {
    const developmentOrigins = getAuthTrustedOrigins({
      baseUrl: "http://localhost:3000",
      nodeEnv: "development",
    })
    const productionOrigins = getAuthTrustedOrigins({
      baseUrl: "https://app.example.com",
      nodeEnv: "production",
    })

    expect(developmentOrigins).toContain("http://10.0.2.2:3000")
    expect(productionOrigins).not.toContain("http://localhost:3000")
  })
})
