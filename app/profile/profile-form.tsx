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
    <form onSubmit={(event) => { event.preventDefault(); void submit(new FormData(event.currentTarget)) }} className="mt-6">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.5fr)]">
        <section className="rounded-2xl border border-[#eadfd2] bg-[#fcf8f1] p-4 sm:p-5">
          <label className="mb-3 block text-sm font-semibold text-[#594638]">Profile image</label>
          <FileUploader
            variant="profile"
            kind="image"
            label="Profile image"
            value={image}
            onUploaded={(result) => setImage(result.url)}
            onCleared={() => setImage(null)}
          />
          <p className="mt-3 text-xs leading-5 text-[#8d7b6b]">This image appears in your musician profile and sidebar.</p>
        </section>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor="displayName">Display name <span className="text-[#a24e35]">*</span></label>
            <input id="displayName" name="displayName" defaultValue={initial.displayName} required className="w-full rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor="primaryGenre">Primary genre</label>
            <input id="primaryGenre" name="primaryGenre" defaultValue={initial.primaryGenre ?? ""} className="w-full rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#594638]" htmlFor="bio">Bio</label>
            <textarea id="bio" name="bio" defaultValue={initial.bio ?? ""} rows={6} className="w-full rounded-xl border border-[#dfd0bf] bg-[#fffdf8] px-3.5 py-2.5 text-sm outline-none transition focus:border-[#a24e35] focus:ring-2 focus:ring-[#a24e35]/15" />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-full bg-[#a24e35] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#833d2a] disabled:opacity-50">
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    </form>
  )
}
