// 車両一覧画面（pages/vehicles）で使う表示モデルと純粋関数
import type { TranslateFn } from '~/composables/useI18n'

/** 一覧のカテゴリフィルタ（'All' を含む）。DB の vehicle_categories とは別に固定で持つ仕様 */
export const VEHICLE_CATEGORY_FILTERS = ['All', 'Bike', 'Car', 'Bicycle']

/** 新規登録フォームのカテゴリ選択肢 */
export const VEHICLE_CATEGORY_NAMES = ['Bike', 'Car', 'Bicycle'] as const
export type VehicleCategoryName = typeof VEHICLE_CATEGORY_NAMES[number]

/** 一覧・詳細サイドバーの表示モデル */
export interface Vehicle {
  /** DB の vehicles.code（画面上の "Vehicle ID"） */
  code: string
  name: string
  category: string
  status: string
  statusColor: string
  /** vehicles.updated_at（ISO 文字列）。表示言語に合わせて描画側で整形する */
  lastUpdated: string
  icon: string
  lastMileage: number
  /** 最後にオイル交換した日付（YYYY-MM-DD）。未記録は null */
  lastOilChangeOn: string | null
  imageUrl: string | null
  imageUrls: string[]
}

/** vehicles テーブルの select 結果（リレーション込み）のうち使用する列 */
export interface VehicleRow {
  code: string
  name: string
  updated_at: string
  last_mileage: number | null
  last_oil_change_on: string | null
  image_url: string | null
  image_urls: string[] | null
  vehicle_categories: { name: string | null; icon: string | null } | null
  vehicle_statuses: { name: string | null; color: string | null } | null
}

export interface VehicleFilter {
  search: string
  category: string
  status: string
}

export function toVehicle(v: VehicleRow): Vehicle {
  return {
    code: v.code,
    name: v.name,
    category: v.vehicle_categories?.name || 'Unknown',
    status: v.vehicle_statuses?.name || 'Unknown',
    statusColor: v.vehicle_statuses?.color || 'neutral',
    lastUpdated: v.updated_at,
    icon: v.vehicle_categories?.icon || 'i-lucide-package',
    lastMileage: v.last_mileage || 0,
    lastOilChangeOn: v.last_oil_change_on,
    imageUrl: v.image_url || null,
    imageUrls: v.image_urls || []
  }
}

export function matchesVehicleFilter(v: Vehicle, filter: VehicleFilter): boolean {
  const matchesSearch = (v.name || '').toLowerCase().includes(filter.search.toLowerCase()) ||
                       (v.code || '').toLowerCase().includes(filter.search.toLowerCase())
  const matchesCategory = filter.category === 'All' || v.category === filter.category
  const matchesStatus = filter.status === 'All' || v.status === filter.status
  return !!(matchesSearch && matchesCategory && matchesStatus)
}

/** Available ⇔ Unavailable の切替先ステータス名 */
export function toToggledVehicleStatus(status: string): 'Available' | 'Unavailable' {
  return status === 'Available' ? 'Unavailable' : 'Available'
}

/** 詳細サイドバー "Status Access" の表示文言 */
export function toStatusAccessLabel(status: string, t: TranslateFn): string {
  return status === 'Available' ? t('veh.access.ready') : status === 'Lent' ? t('veh.access.lent') : t('veh.access.maintenance')
}

export function toVehicleQrUrl(code: string, size: number): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${code}`
}

// ---- 日付のみの値（YYYY-MM-DD）----
// new Date('YYYY-MM-DD') は UTC 0 時として解釈され、タイムゾーンによって前日になるため、ローカル日付として扱う

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

/** ローカル日付を YYYY-MM-DD にする（date 入力の値・DB の DATE 列と同じ形式） */
export function toDateOnlyString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** YYYY-MM-DD から today までの経過日数（当日は 0） */
export function daysSinceDateOnly(value: string, today: Date = new Date()): number {
  const start = parseDateOnly(value)
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
}

/** YYYY-MM-DD を表示言語に合わせて整形する */
export function formatDateOnly(value: string, locale: string): string {
  return parseDateOnly(value).toLocaleDateString(locale)
}
