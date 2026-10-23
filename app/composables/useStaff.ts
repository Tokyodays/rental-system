import { ROLE_IDS } from '#shared/constants/auth'

/**
 * ログイン中のスタッフ情報（role含む）を取得・キャッシュするcomposable
 * Nuxt Supabase の useSupabaseUser() が不安定なケースに備え、
 * 直接 auth.getUser() を使用してセッションを管理します。
 */
export const useStaff = () => {
  const supabase = useSupabaseClient()
  // 実行中の取得を共有するための置き場所。サーバーではリクエストごと、ブラウザではアプリで1つ
  const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & {
    _staffSyncing?: Promise<void> | null
    _staffFetching?: Promise<void> | null
  }
  
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
    /** 本人が選んだ表示言語。NULL なら店舗のデフォルト言語に従う */
    locale: string | null
    staff_roles: { name: string } | null
    stores: StoreRecord | null
  }

  const staff = useState<StaffRecord | null>('current-staff', () => null)
  const isLoading = useState<boolean>('current-staff-loading', () => false)

  // super_admin: オーナー（店舗管理専用）
  const isSuperAdmin = computed(() => {
    if (!staff.value) return false
    return staff.value.role_id === ROLE_IDS.SUPER_ADMIN ||
      staff.value.staff_roles?.name === 'super_admin'
  })

  // isAdmin: ブランチ管理者（super_admin は含まない）
  const isAdmin = computed(() => {
    if (!staff.value) return false
    return staff.value.role_id === ROLE_IDS.ADMIN ||
      staff.value.staff_roles?.name === 'admin'
  })

  /**
   * スタッフ情報を取得する
   * 取得済みなら何もしない。店舗設定の保存後など、最新の値が必要なときは force: true で取り直す
   */
  const fetchStaff = async ({ force = false }: { force?: boolean } = {}) => {
    const uid = user.value?.id
    if (!uid) return

    if (!force && staff.value && staff.value.id === uid) return

    // 複数のコンポーネントから同時に呼ばれても、取得は1回にまとめる
    if (!force && nuxtApp._staffFetching) return nuxtApp._staffFetching
    const fetching = loadStaff(uid)
    nuxtApp._staffFetching = fetching
    try {
      await fetching
    } finally {
      if (nuxtApp._staffFetching === fetching) nuxtApp._staffFetching = null
    }
  }

  const loadStaff = async (uid: string) => {
    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, username, store_id, role_id, locale, staff_roles(name), stores(id, name, address, currency_id, default_locale, currency(id, currency_text, currency_symbol))')
        .eq('id', uid)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        staff.value = {
          id: uid,
          username: user.value?.email?.split('@')[0] || 'Unknown',
          store_id: null,
          role_id: '',
          locale: null,
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
    // 各コンポーネントの onMounted から同時に呼ばれるため、実行中の確認があればそれを待つ
    // （getUser は認証ロックを取って1件ずつ処理されるので、重複すると待ち時間が積み重なる）
    if (nuxtApp._staffSyncing) return nuxtApp._staffSyncing
    const syncing = verifyUser()
    nuxtApp._staffSyncing = syncing
    try {
      await syncing
    } finally {
      nuxtApp._staffSyncing = null
    }
  }

  const verifyUser = async () => {
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
  if (import.meta.client) {
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
      // コールバックは認証ロックを持ったまま呼ばれることがある（トークン更新時など）。
      // ここで Supabase の読み込みを await すると、その読み込みがロックの解放を待ってデッドロックするため、
      // 読み込みはコールバックが終わってから実行する（Supabase のドキュメントの推奨どおり）
      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          user.value = session.user
          setTimeout(() => { fetchStaff() }, 0)
        } else {
          user.value = null
          staff.value = null
        }
      })
    }
  }

  return { user, staff, isAdmin, isSuperAdmin, isLoading, fetchStaff, syncUser }
}
