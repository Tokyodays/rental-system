import { diffToDaysHours } from './duration'

/** 返却予定日時までの貸出期間表示（例: "2 days 3 hours"）。過去日時なら 'Invalid (Past date)' */
export function toLendingDurationText(returnAt: string, now: Date): string {
  if (!returnAt) return ''
  const diffMs = new Date(returnAt).getTime() - now.getTime()
  if (diffMs < 0) return 'Invalid (Past date)'

  const { days, hours } = diffToDaysHours(diffMs)

  if (days === 0) return `${hours} hours`
  return `${days} days ${hours} hours`
}

/** 返却予定日時が未入力、または現在以前か */
export function isReturnAtNotInFuture(returnAt: string, now: Date): boolean {
  if (!returnAt) return true
  return new Date(returnAt).getTime() <= now.getTime()
}

/** 実返却日時が返却予定日時より後（延滞）か */
export function isReturnDelayed(scheduledEndAt: string, actualReturnAt: Date): boolean {
  return actualReturnAt.getTime() > new Date(scheduledEndAt).getTime()
}

/** 返却予定との差分表示（例: "Delayed by 1d 2h" / "Early by 3h" / "Exactly on time"） */
export function toReturnTimeDiffText(scheduledEndAt: string, actualReturnAt: Date): string {
  const diffMs = actualReturnAt.getTime() - new Date(scheduledEndAt).getTime()

  const { days, hours } = diffToDaysHours(diffMs)

  const timeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h`

  if (diffMs > 0) return `Delayed by ${timeStr}`
  if (diffMs < 0) return `Early by ${timeStr}`
  return 'Exactly on time'
}

/** 返却予定との差分表示の文字色クラス（延滞なら赤、それ以外は緑） */
export function toReturnTimeDiffColorClass(scheduledEndAt: string, actualReturnAt: Date): string {
  return isReturnDelayed(scheduledEndAt, actualReturnAt) ? 'text-red-600' : 'text-green-600'
}
