export interface RentalExtension {
  id: string
  previous_end_at: string
  new_end_at: string
  additional_price: number
  note: string | null
  created_at: string
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 日時を <input type="date"> / <input type="time"> 用のローカル日付・時刻文字列に分ける */
export function toLocalDateTimeInputs(date: Date): { date: string, time: string } {
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

/** 日時に日数を足した新しい Date を返す（時刻はそのまま） */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** 延長料金の合計 */
export function sumExtensionPrice(extensions: Pick<RentalExtension, 'additional_price'>[]): number {
  return extensions.reduce((sum, e) => sum + Number(e.additional_price || 0), 0)
}

/** 延長を作成順（古い順）に並べる */
export function sortExtensions<T extends Pick<RentalExtension, 'created_at'>>(extensions: T[]): T[] {
  return [...extensions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}
