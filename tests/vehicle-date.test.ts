// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { daysSinceDateOnly, toDateOnlyString } from '../app/utils/vehicle'

describe('date-only helpers (last oil change)', () => {
  it('formats a local date as YYYY-MM-DD without shifting to UTC', () => {
    // 深夜でも UTC に変換して前日・翌日にならない
    expect(toDateOnlyString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(toDateOnlyString(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31')
  })

  it('counts elapsed days from a YYYY-MM-DD value', () => {
    const today = new Date(2026, 9, 22, 8, 30)
    expect(daysSinceDateOnly('2026-10-22', today)).toBe(0)
    expect(daysSinceDateOnly('2026-10-21', today)).toBe(1)
    expect(daysSinceDateOnly('2026-09-22', today)).toBe(30)
    // 年をまたぐ
    expect(daysSinceDateOnly('2025-12-31', new Date(2026, 0, 1, 23, 0))).toBe(1)
  })

  it('round-trips with toDateOnlyString', () => {
    const today = new Date(2026, 2, 29, 1, 0) // 夏時間の切り替え前後でも日数がずれない
    expect(daysSinceDateOnly(toDateOnlyString(today), today)).toBe(0)
    expect(daysSinceDateOnly('2026-03-28', today)).toBe(1)
  })
})
