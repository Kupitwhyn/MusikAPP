import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Reverb — Digital Music Archive",
  description:
    "A digital archive where musicians publish and catalog their work, and listeners discover and collect it.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#211f1c" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
