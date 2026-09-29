"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUploader } from "@/components/file-uploader"
import { saveMyProfile, type ProfileInput } from "@/app/actions/profile"

type ExistingProfile = { displayName: string; bio: string | null; primaryGenre: string | null; imageUrl: string | null }

export function ProfileForm({ initial }: { initial: ExistingProfile }) {
  const router = useRouter()
  const [image, setImage] = useState(initial.imageUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(formData: FormData) {
    setSaving(true)
    setError(null)
    try {
      const input: ProfileInput = {
        displayName: String(formData.get("displayName") ?? ""),
        bio: String(formData.get("bio") ?? "") || null,
        primaryGenre: String(formData.get("primaryGenre") ?? "") || null,
        imageUrl: image,
      }
      await saveMyProfile(input)
      router.push("/dashboard")
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save profile")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); void submit(new FormData(event.currentTarget)) }} className="mt-6 space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" defaultValue={initial.displayName} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="primaryGenre">Primary genre</label>
        <input id="primaryGenre" name="primaryGenre" defaultValue={initial.primaryGenre ?? ""} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" defaultValue={initial.bio ?? ""} rows={5} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Profile image</label>
        <FileUploader kind="image" value={image} onUploaded={(result) => setImage(result.url)} onCleared={() => setImage(null)} />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <button type="submit" disabled={saving} className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50">
        {saving ? "Saving..." : "Save profile"}
      </button>
    </form>
  )
}
