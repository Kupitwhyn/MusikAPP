import { describe, expect, it } from "vitest"
import {
  canCreateFavorite,
  canReportWork,
  hasOpenReportForReporter,
  isPublishedWork,
  validateRequiredTitle,
  validateRequiredWorkFields,
} from "../lib/domain-rules"

describe("work visibility rules", () => {
  it("only treats published works as public", () => {
    expect(isPublishedWork("PUBLISHED")).toBe(true)
    expect(isPublishedWork("HIDDEN")).toBe(false)
    expect(isPublishedWork("DRAFT")).toBe(false)
  })

  it("allows favorites only for published works", () => {
    expect(canCreateFavorite("PUBLISHED")).toBe(true)
    expect(canCreateFavorite("HIDDEN")).toBe(false)
  })

  it("requires a reason before reporting a published work", () => {
    expect(canReportWork("PUBLISHED", "Copyright")).toBe(true)
    expect(canReportWork("PUBLISHED", "  ")).toBe(false)
    expect(canReportWork("HIDDEN", "Copyright")).toBe(false)
  })
})

describe("report deduplication", () => {
  it("detects an existing open report from the same reporter", () => {
    const reports = [
      { workId: 1, reporterId: "audience-1", status: "OPEN" },
      { workId: 1, reporterId: "audience-2", status: "RESOLVED" },
    ]
    expect(hasOpenReportForReporter(reports, 1, "audience-1")).toBe(true)
    expect(hasOpenReportForReporter(reports, 1, "audience-2")).toBe(false)
    expect(hasOpenReportForReporter(reports, 2, "audience-1")).toBe(false)
  })

})

describe("project input rules", () => {
  it("trims project titles", () => {
    expect(validateRequiredTitle("  Ambient Sessions  ")).toBe("Ambient Sessions")
  })

  describe("work input rules", () => {
    const valid = {
      title: "Pulang",
      artist: "Suara Senja",
      audioUrl: "https://blob.example/audio.mp3",
      genreId: 1,
      createdDate: "2026-01-01",
      releasedDate: "2026-01-02",
    }

    it("accepts a complete work", () => {
      expect(() => validateRequiredWorkFields(valid)).not.toThrow()
    })

    it.each([
      ["genreId", { genreId: null }, "Genre is required"],
      ["createdDate", { createdDate: null }, "Created date is required"],
      ["releasedDate", { releasedDate: null }, "Released date is required"],
    ])("rejects a work without %s", (_, override, message) => {
      expect(() => validateRequiredWorkFields({ ...valid, ...override })).toThrow(message)
    })
  })

  it("rejects blank project titles", () => {
    expect(() => validateRequiredTitle("   ")).toThrow("Title is required")
  })
})
