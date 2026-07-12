/**
 * ログイン中のスタッフ情報（role含む）を取得・キャッシュするcomposable
 * Nuxt Supabase の useSupabaseUser() が不安定なケースに備え、
 * 直接 auth.getUser() を使用してセッションを管理します。
 */
export const useStaff = () => {
  const supabase = useSupabaseClient()
  
  // 独自にユーザー状態を管理（モジュールのステートに依存しない）
  const user = useState<any>('verified-supabase-user', () => null)

    interface StoreRecord {
    id: string
    name: string
    address: string | null
    currency_id: number | null
    default_locale: string | null
    currency: {
      id: number
      currency_text: string
      currency_symbol: string
    } | null
  }

  interface StaffRecord {
    id: string
    username: string | null
    store_id: string | null
    role_id: string
    staff_roles: { name: string } | null
    stores: StoreRecord | null
  }

  const SUPER_ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000000'
  const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'

  const staff = useState<StaffRecord | null>('current-staff', () => null)
  const isLoading = useState<boolean>('current-staff-loading', () => false)

  // super_admin: オーナー（店舗管理専用）
  const isSuperAdmin = computed(() => {
    if (!staff.value) return false
    return staff.value.role_id === SUPER_ADMIN_ROLE_ID ||
      staff.value.staff_roles?.name === 'super_admin'
  })

  // isAdmin: ブランチ管理者（super_admin は含まない）
  const isAdmin = computed(() => {
    if (!staff.value) return false
    return staff.value.role_id === ADMIN_ROLE_ID ||
      staff.value.staff_roles?.name === 'admin'
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
        .select('id, username, store_id, role_id, staff_roles(name), stores(id, name, address, currency_id, currency(id, currency_text, currency_symbol))')
        .eq('id', uid)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        staff.value = {
          id: uid,
          username: user.value?.email?.split('@')[0] || 'Unknown',
          store_id: null,
          role_id: '',
          staff_roles: { name: 'user' },
          stores: null
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

  // 初期化およびイベント監視（コンポーネントの setup 内のみ登録）
  if (process.client) {
    const instance = getCurrentInstance()
    if (instance) {
      onMounted(() => {
        syncUser()
      })
    }

    // onAuthStateChange はアプリ全体で1回だけ登録
    const listenerRegistered = useState<boolean>('staff-auth-listener', () => false)
    if (!listenerRegistered.value) {
      listenerRegistered.value = true
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          user.value = session.user
          await fetchStaff()
        } else {
          user.value = null
          staff.value = null
        }
      })
    }
  }

  return { user, staff, isAdmin, isSuperAdmin, isLoading, fetchStaff, syncUser }
}
