export const PUBLISHED_STATUS = "PUBLISHED"
export const OPEN_REPORT_STATUS = "OPEN"

export function validateRequiredTitle(title: string): string {
  const cleaned = title.trim()
  if (!cleaned) throw new Error("Title is required")
  return cleaned
}

export function validateRequiredWorkFields(input: {
  title?: string | null
  artist?: string | null
  audioUrl?: string | null
  genreId?: number | null
  createdDate?: string | null
  releasedDate?: string | null
}) {
  if (!input.title?.trim()) throw new Error("Title is required")
  if (!input.artist?.trim()) throw new Error("Artist is required")
  if (!input.audioUrl?.trim()) throw new Error("Audio file is required")
  if (input.genreId == null) throw new Error("Genre is required")
  if (!input.createdDate?.trim()) throw new Error("Created date is required")
  if (!input.releasedDate?.trim()) throw new Error("Released date is required")
}

export function isPublishedWork(status: string): boolean {
  return status === PUBLISHED_STATUS
}

export function canCreateFavorite(status: string): boolean {
  return isPublishedWork(status)
}

export function canReportWork(status: string, reason: string): boolean {
  return isPublishedWork(status) && Boolean(reason.trim())
}

export function hasOpenReportForReporter(
  reports: Array<{ workId: number; reporterId: string | null; status: string }>,
  workId: number,
  reporterId: string,
): boolean {
  return reports.some(
    (report) =>
      report.workId === workId &&
      report.reporterId === reporterId &&
      report.status === OPEN_REPORT_STATUS,
  )
}
