// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { selectReturnsDue } from '../app/utils/rentalSchedule'

// ローカル時刻で日時を作る（端末のタイムゾーンに関係なく「その日の何時」を表す）
const at = (y: number, mo: number, d: number, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi).toISOString()
const tx = (id: string, endAt: string | null, status = 'Active') => ({ id, status, end_at: endAt })

describe('selectReturnsDue (dashboard: today\'s returns)', () => {
  const now = new Date(2026, 9, 23, 13, 0) // 10/23 13:00

  it('includes active rentals due today and overdue ones, sorted by due time', () => {
    const result = selectReturnsDue([
      tx('later-today', at(2026, 10, 23, 18, 0)),
      tx('yesterday', at(2026, 10, 22, 10, 0)),
      tx('this-morning', at(2026, 10, 23, 9, 0)),
      tx('tomorrow', at(2026, 10, 24, 0, 0)),
      tx('returned', at(2026, 10, 23, 15, 0), 'Completed'),
      tx('no-due', null)
    ], now)

    expect(result.map(r => r.transaction.id)).toEqual(['yesterday', 'this-morning', 'later-today'])
    expect(result.map(r => r.isOverdue)).toEqual([true, true, false])
  })

  it('treats the last minute of today as today and midnight as tomorrow', () => {
    const result = selectReturnsDue([
      tx('23:59', at(2026, 10, 23, 23, 59)),
      tx('00:00 next day', at(2026, 10, 24, 0, 0))
    ], now)
    expect(result.map(r => r.transaction.id)).toEqual(['23:59'])
  })

  it('returns nothing when no rental is due', () => {
    expect(selectReturnsDue([tx('next week', at(2026, 10, 30, 10, 0))], now)).toEqual([])
  })
})
