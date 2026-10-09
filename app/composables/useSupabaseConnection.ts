/**
 * Supabase の接続状態を管理・監視する composable
 */
export const useSupabaseConnection = () => {
  const supabase = useSupabaseClient()
  
  // 接続エラーの状態を管理
  const connectionError = useState<{
    isError: boolean
    message: string
    code?: string
  }>('supabase-connection-status', () => ({
    isError: false,
    message: ''
  }))

  const isChecking = useState('supabase-connection-checking', () => false)

  /**
   * Supabase への疎通確認を行う
   */
  const checkConnection = async () => {
    if (isChecking.value) return
    isChecking.value = true
    
    try {
      // 非常に軽量なクエリで接続テストを行う
      // auth.getUser() はセッションリフレッシュを伴うため、ネットワークエラー検知に有効
      const { error } = await supabase.auth.getUser()
      
      if (error) {
        // 認証エラー（Invalid tokenなど）は接続エラーとは区別する
        // ネットワークエラー（fetch failed, ENOTFOUNDなど）を検知
        if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
          throw error
        }
      }
      
      // 正常な場合
      connectionError.value = { isError: false, message: '' }
    } catch (err: any) {
      console.error('[Supabase Connection Error]:', err)
      
      let message = 'Supabase への接続に失敗しました。'
      if (err.message?.includes('ENOTFOUND')) {
        message = 'Supabase のホスト名が見つかりません。プロジェクトが一時停止（Paused）されていないか確認してください。'
      } else if (err.message?.includes('fetch failed')) {
        message = 'ネットワークエラーが発生しました。Supabase サーバーに到達できません。'
      }

      connectionError.value = {
        isError: true,
        message,
        code: err.code || 'CONNECTION_ERROR'
      }
    } finally {
      isChecking.value = false
    }
  }

  // アプリ起動時に一度チェック（クライアントサイドのみ）
  if (import.meta.client) {
    onMounted(() => {
      checkConnection()
    })
  }

  return {
    connectionError,
    isChecking,
    checkConnection
  }
}
