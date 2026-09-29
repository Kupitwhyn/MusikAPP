"use client"

import type React from "react"

import { useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X, Music, ImageIcon } from "lucide-react"

type UploaderProps = {
  kind: "audio" | "image"
  value?: string | null
  onUploaded: (result: { url: string; size: number; format: string }) => void
  onCleared?: () => void
  label?: string
}

const ACCEPT = {
  audio: "audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/x-m4a,.mp3,.wav,.flac,.m4a",
  image: "image/jpeg,image/png,image/webp",
}

export function FileUploader({ kind, value, onUploaded, onCleared, label }: UploaderProps) {
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

  if (kind === "image") {
    return (
      <div className="flex flex-col gap-2">
        <div
          className={cn(
            "group relative flex aspect-square w-40 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/40",
            hasValue && "border-solid",
          )}
        >
          {hasValue ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value! || "/placeholder.svg"} alt="Selected artwork" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <ImageIcon className="h-6 w-6" />
              <span className="font-mono text-[10px] uppercase tracking-wider">Artwork</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept={ACCEPT.image} className="hidden" onChange={onChange} />
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload className="h-3.5 w-3.5" />
            {hasValue ? "Replace" : "Upload"}
          </Button>
          {hasValue && onCleared && (
            <Button type="button" size="sm" variant="ghost" onClick={onCleared} disabled={uploading}>
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
          "flex items-center gap-3 rounded-md border border-dashed border-border p-4",
          hasValue && "border-solid bg-muted/40",
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent-foreground">
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
            <p className="text-sm text-muted-foreground">MP3, WAV, FLAC or M4A — up to 100 MB</p>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {hasValue ? "Replace" : "Upload"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
