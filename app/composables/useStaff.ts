/**
 * ログイン中のスタッフ情報（role含む）を取得・キャッシュするcomposable
 */
export const useStaff = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  interface StaffRole {
    name: string
  }

  interface StaffRecord {
    id: string
    full_name: string | null
    store_id: string | null
    role_id: string
    staff_roles: StaffRole | null
  }

  const staff = useState<StaffRecord | null>('current-staff', () => null)
  const isLoading = useState<boolean>('current-staff-loading', () => false)

  const isAdmin = computed(() => staff.value?.staff_roles?.name === 'admin')

  const fetchStaff = async () => {
    if (!user.value) return
    if (staff.value) return // キャッシュ済みなら再取得しない

    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, store_id, role_id, staff_roles(name)')
        .eq('id', user.value.id)
        .single()

      if (error) throw error
      staff.value = data as StaffRecord
    } catch (err) {
      console.error('[useStaff] fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { staff, isAdmin, isLoading, fetchStaff }
}
