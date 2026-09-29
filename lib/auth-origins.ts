type AuthOriginConfig = {
  baseUrl: string
  nodeEnv?: string
  vercelUrl?: string
  vercelProductionUrl?: string
  trustedOrigins?: string
  mobileWebOrigin?: string
  v0Origins?: string[]
}

function parseOrigin(value: string, label: string, production: boolean): string {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    throw new Error(`${label} must be a valid HTTP(S) origin`)
  }

  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.origin !== value ||
    parsed.username ||
    parsed.password
  ) {
    throw new Error(`${label} must be an origin without credentials, path, query, or fragment`)
  }

  if (production && parsed.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS in production`)
  }

  return parsed.origin
}

export function getAuthTrustedOrigins(config: AuthOriginConfig): string[] {
  const production = config.nodeEnv === "production"
  const origins = [
    parseOrigin(config.baseUrl, "Auth base URL", production),
    ...(config.vercelUrl ? [`https://${config.vercelUrl}`] : []),
    ...(config.vercelProductionUrl ? [`https://${config.vercelProductionUrl}`] : []),
    ...(config.mobileWebOrigin ? [config.mobileWebOrigin] : []),
    ...(config.trustedOrigins?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
    ...(!production
      ? [
          "http://localhost:3000",
          "http://10.0.2.2:3000",
          "http://localhost:8082",
          "http://127.0.0.1:8082",
          ...(config.v0Origins ?? []),
        ]
      : []),
  ]

  return [...new Set(origins.map((origin) => parseOrigin(origin, "Trusted origin", production)))]
}
