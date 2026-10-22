import { diffToDaysHours } from './duration'
import type { TranslateFn } from '~/composables/useI18n'

/** 返却予定日時までの貸出期間表示（例: "2 days 3 hours"、表示言語に翻訳）。過去日時なら無効表示 */
export function toLendingDurationText(returnAt: string, now: Date, t: TranslateFn): string {
  if (!returnAt) return ''
  const diffMs = new Date(returnAt).getTime() - now.getTime()
  if (diffMs < 0) return t('duration.invalid_past')

  const { days, hours } = diffToDaysHours(diffMs)

  if (days === 0) return t('duration.hours', { h: hours })
  return t('duration.days_hours', { d: days, h: hours })
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
export function toReturnTimeDiffText(scheduledEndAt: string, actualReturnAt: Date, t: TranslateFn): string {
  const diffMs = actualReturnAt.getTime() - new Date(scheduledEndAt).getTime()

  const { days, hours } = diffToDaysHours(diffMs)

  const timeStr = days > 0 ? t('duration.short_dh', { d: days, h: hours }) : t('duration.short_h', { h: hours })

  if (diffMs > 0) return t('return.delayed_by', { time: timeStr })
  if (diffMs < 0) return t('return.early_by', { time: timeStr })
  return t('return.on_time')
}

/** 返却予定との差分表示の文字色クラス（延滞なら赤、それ以外は緑） */
export function toReturnTimeDiffColorClass(scheduledEndAt: string, actualReturnAt: Date): string {
  return isReturnDelayed(scheduledEndAt, actualReturnAt) ? 'text-red-600' : 'text-green-600'
}

/** ダッシュボード「本日の返却予定」に出す貸出 */
export interface ReturnDueItem<T> {
  transaction: T
  /** 返却予定日時を過ぎている（前日以前の予定、または本日の予定時刻を過ぎた） */
  isOverdue: boolean
}

/**
 * 貸出中（status = 'Active'）のうち、返却予定が本日中（端末のローカル日付）または既に過ぎているものを、
 * 返却予定の早い順に返す。延長すると end_at が更新されるので、end_at が現在の返却予定。
 */
export function selectReturnsDue<T extends { status: string | null, end_at: string | null }>(
  transactions: T[],
  now: Date
): ReturnDueItem<T>[] {
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return transactions
    .filter(tx => tx.status === 'Active' && tx.end_at && new Date(tx.end_at) < endOfToday)
    .sort((a, b) => new Date(a.end_at!).getTime() - new Date(b.end_at!).getTime())
    .map(tx => ({ transaction: tx, isOverdue: new Date(tx.end_at!) < now }))
}
