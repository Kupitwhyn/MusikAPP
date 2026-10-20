/** @type {import('next').NextConfig} */
const mobileWebOrigin =
  process.env.MOBILE_WEB_ORIGIN ??
  (process.env.NODE_ENV === "development" ? "http://localhost:8082" : null)

if (mobileWebOrigin) {
  const parsedOrigin = new URL(mobileWebOrigin)
  if (parsedOrigin.origin !== mobileWebOrigin) {
    throw new Error("MOBILE_WEB_ORIGIN must be an origin without a path or trailing slash")
  }
  if (process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "https:") {
    throw new Error("MOBILE_WEB_ORIGIN must use HTTPS in production")
  }
}

const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    const corsHeaders = mobileWebOrigin
      ? [
          { key: "Access-Control-Allow-Origin", value: mobileWebOrigin },
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, DELETE, OPTIONS" },
        ]
      : []

    return [
      ...(corsHeaders.length
        ? [
            {
              source: "/api/:path*",
              headers: corsHeaders,
            },
          ]
        : []),
    ]
  },
}

export default nextConfig
