// 車両一覧画面（pages/vehicles）で使う表示モデルと純粋関数

/** 一覧のカテゴリフィルタ（'All' を含む）。DB の vehicle_categories とは別に固定で持つ仕様 */
export const VEHICLE_CATEGORY_FILTERS = ['All', 'Bike', 'Car', 'Bicycle']

/** 新規登録フォームのカテゴリ選択肢 */
export const VEHICLE_CATEGORY_OPTIONS = [
  { label: 'Bike', value: 'Bike' },
  { label: 'Car', value: 'Car' },
  { label: 'Bicycle', value: 'Bicycle' }
]

/** 一覧・詳細サイドバーの表示モデル */
export interface Vehicle {
  /** DB の vehicles.code（画面上の "Vehicle ID"） */
  code: string
  name: string
  category: string
  status: string
  statusColor: string
  lastUpdated: string
  icon: string
  lastMileage: number
  imageUrl: string | null
  imageUrls: string[]
}

/** vehicles テーブルの select 結果（リレーション込み）のうち使用する列 */
export interface VehicleRow {
  code: string
  name: string
  updated_at: string
  last_mileage: number | null
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
    lastUpdated: new Date(v.updated_at).toLocaleDateString(),
    icon: v.vehicle_categories?.icon || 'i-lucide-package',
    lastMileage: v.last_mileage || 0,
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
export function toStatusAccessLabel(status: string): string {
  return status === 'Available' ? 'Ready for Use' : status === 'Lent' ? 'Currently Lent' : 'Under Maintenance'
}

export function toVehicleQrUrl(code: string, size: number): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${code}`
}
