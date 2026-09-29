import { matchesRentalVehicleSearch, type RentalVehicle } from '~/utils/rentalVehicles'

/**
 * 指定ステータスの車両一覧（貸出画面: Available / 返却画面: Lent）の取得と検索フィルタ
 * @param statusName 取得対象の車両ステータス名
 * @param loadErrorDescription 取得失敗時の toast description
 */
export const useRentalVehicles = (statusName: 'Available' | 'Lent', loadErrorDescription: string) => {
  const supabase = useSupabaseClient()
  const toast = useToast()
  const { ensureLoaded, vehicleStatusId } = useStatusIds()

  const vehicles = ref<RentalVehicle[]>([])
  const isLoadingVehicles = ref(false)
  const vehicleSearch = ref('')

  async function fetchVehicles() {
    isLoadingVehicles.value = true
    try {
      await ensureLoaded()
      const statusId = vehicleStatusId(statusName)
      if (!statusId) return

      const { data, error } = await (supabase
        .from('vehicles')
        .select('*, vehicle_categories(name, icon), vehicle_statuses(name)')
        .eq('status_id', statusId)
        .order('name') as any)

      if (!error) vehicles.value = data || []
    } catch (e: any) {
      toast.add({ title: 'Error', description: loadErrorDescription, color: 'error' })
    } finally {
      isLoadingVehicles.value = false
    }
  }

  const filteredVehicles = computed(() =>
    vehicles.value.filter(v => matchesRentalVehicleSearch(v, vehicleSearch.value))
  )

  return { vehicles, isLoadingVehicles, vehicleSearch, filteredVehicles, fetchVehicles }
}
