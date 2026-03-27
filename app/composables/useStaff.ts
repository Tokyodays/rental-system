/**
 * ログイン中のスタッフ情報（role含む）を取得・キャッシュするcomposable
 * Nuxt Supabase の useSupabaseUser() が不安定なケースに備え、
 * 直接 auth.getUser() を使用してセッションを管理します。
 */
export const useStaff = () => {
  const supabase = useSupabaseClient()
  
  // 独自にユーザー状態を管理（モジュールのステートに依存しない）
  const user = useState<any>('verified-supabase-user', () => null)

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

  const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'

  const staff = useState<StaffRecord | null>('current-staff', () => null)
  const isLoading = useState<boolean>('current-staff-loading', () => false)

  const isAdmin = computed(() => {
    if (!staff.value) return false
    return staff.value.staff_roles?.name === 'admin' || staff.value.role_id === ADMIN_ROLE_ID
  })

  /**
   * スタッフ情報を取得する
   */
  const fetchStaff = async () => {
    const uid = user.value?.id
    if (!uid) return

    if (staff.value && staff.value.id === uid) return 

    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, full_name, store_id, role_id, staff_roles(name)')
        .eq('id', uid)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        staff.value = {
          id: uid,
          full_name: user.value?.email?.split('@')[0] || 'Unknown',
          store_id: null,
          role_id: '',
          staff_roles: { name: 'user' }
        }
      } else {
        staff.value = data as StaffRecord
      }
    } catch (err) {
      console.error('[useStaff] fetch error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * セッションの強制的な同期
   */
  const syncUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (supabaseUser) {
      user.value = supabaseUser
      await fetchStaff()
    } else {
      user.value = null
      staff.value = null
    }
  }

  // 初期化およびイベント監視
  if (process.client) {
    onMounted(() => {
      syncUser()
    })

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useStaff] auth event context:', event)
      if (session?.user) {
        user.value = session.user
        await fetchStaff()
      } else {
        user.value = null
        staff.value = null
      }
    })
  }

  return { user, staff, isAdmin, isLoading, fetchStaff, syncUser }
}
