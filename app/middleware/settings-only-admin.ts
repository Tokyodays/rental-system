/**
 * Settingsページのアクセス制限
 * adminロールのユーザーのみアクセス可能
 */
export default defineNuxtRouteMiddleware(async () => {
  const { isAdmin, syncUser } = useStaff()

  // フルナビゲーション時は useState('verified-supabase-user') が null に戻るため、
  // fetchStaff ではなく syncUser を呼んで supabase.auth.getUser() から user → staff の順で解決する
  await syncUser()

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
