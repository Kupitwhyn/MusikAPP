"use client"

import type React from "react"

import { useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, Music, ImageIcon } from "lucide-react"

type UploaderProps = {
  kind: "audio" | "image"
  variant?: "default" | "archive" | "profile"
  value?: string | null
  onUploaded: (result: { url: string; size: number; format: string }) => void
  onCleared?: () => void
  label?: string
}

const ACCEPT = {
  audio: "audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/x-m4a,.mp3,.wav,.flac,.m4a",
  image: "image/jpeg,image/png,image/webp",
}

export function FileUploader({ kind, variant = "default", value, onUploaded, onCleared, label }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    setProgress(0)
    setFileName(file.name)
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      })
      const ext = file.name.split(".").pop()?.toUpperCase() ?? ""
      onUploaded({ url: blob.url, size: file.size, format: ext })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const hasValue = Boolean(value)
  const archive = variant === "archive"
  const profile = variant === "profile"

  if (kind === "image") {
    return (
      <div className="flex flex-col gap-2">
        <div
          className={cn(
            "group relative flex items-center justify-center overflow-hidden border border-dashed transition-colors",
            archive
              ? "aspect-[2.2/1] w-full rounded-2xl border-[#dfd0bf] bg-gradient-to-br from-[#fcf8f1] to-[#f3e7d8]"
              : profile
                ? "aspect-square w-full max-w-[260px] rounded-2xl border-[#dfd0bf] bg-gradient-to-br from-[#fcf8f1] to-[#f3e7d8]"
              : "aspect-square w-40 rounded-md border-border bg-muted/40",
            hasValue && "border-solid",
          )}
        >
          {hasValue ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value! || "/placeholder.svg"} alt={`Selected ${label ?? "artwork"}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageIcon className={cn("h-6 w-6", archive || profile ? "text-[#a24e35]" : "")} />
              <span className={cn("font-mono text-[10px] uppercase tracking-wider", archive || profile ? "text-[#80634d]" : "")}>{label ?? "Artwork"}</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept={ACCEPT.image} className="hidden" onChange={onChange} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" className={archive || profile ? "rounded-full border-[#dfc6b0] bg-[#fffdf8] text-[#91472d] hover:bg-[#f8eee3] hover:text-[#783a28]" : undefined} onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload className="h-3.5 w-3.5" />
            {hasValue ? "Replace" : "Upload"}
          </Button>
          {hasValue && onCleared && (
            <Button type="button" size="sm" variant="ghost" className={archive || profile ? "rounded-full text-[#80685a] hover:bg-[#f4e9dd]" : undefined} onClick={onCleared} disabled={uploading}>
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="file" accept={ACCEPT.audio} className="hidden" onChange={onChange} />
      <div
        className={cn(
          "flex items-center gap-3 border border-dashed transition-colors",
          archive ? "min-h-[110px] rounded-2xl border-[#dfd0bf] bg-gradient-to-br from-[#fcf8f1] to-[#f3e7d8] p-4 sm:p-5" : "rounded-md border-border p-4",
          hasValue && (archive ? "border-solid bg-[#f8eee3]" : "border-solid bg-muted/40"),
        )}
      >
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center", archive ? "rounded-full bg-[#f0dfce] text-[#a24e35]" : "rounded-md bg-accent/15 text-accent-foreground")}>
          <Music className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          {uploading ? (
            <>
              <p className="truncate text-sm font-medium">{fileName}</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : hasValue ? (
            <p className="truncate text-sm font-medium">{label ?? fileName ?? "Audio uploaded"}</p>
          ) : (
            <p className={cn("text-sm", archive ? "text-[#78685b]" : "text-muted-foreground")}>MP3, WAV, FLAC or M4A — up to 100 MB</p>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" className={archive ? "rounded-full border-[#d8b49a] bg-[#fffdf8] text-[#91472d] hover:bg-[#f8eee3] hover:text-[#783a28]" : undefined} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {hasValue ? "Replace" : "Upload"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
