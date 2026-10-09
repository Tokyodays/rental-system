/** 貸出・返却画面の車両一覧で扱う車両行（vehicle_categories / vehicle_statuses を join 済み） */
export interface RentalVehicle {
  id: string
  name: string
  code: string
  last_mileage?: number | null
  vehicle_categories?: { name: string | null; icon: string | null } | null
  vehicle_statuses?: { name: string } | null
}

/** QR スキャンのシミュレーション待機時間 */
export const SIMULATED_SCAN_DELAY_MS = 1500

/** 車両が検索語（name / code / カテゴリ名の部分一致・大文字小文字無視）に一致するか */
export function matchesRentalVehicleSearch(vehicle: RentalVehicle, search: string): boolean {
  const s = search.toLowerCase()
  return (
    vehicle.name.toLowerCase().includes(s) ||
    vehicle.code.toLowerCase().includes(s) ||
    !!(vehicle.vehicle_categories?.name && vehicle.vehicle_categories.name.toLowerCase().includes(s))
  )
}

/** QR スキャンのシミュレーションとして一定時間待機する */
export function waitForSimulatedScan(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, SIMULATED_SCAN_DELAY_MS))
}
