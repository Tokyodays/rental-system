export default defineNuxtRouteMiddleware(async (to) => {
  // Landing page is public
  if (to.path === '/') return

  const isAdminPath = to.path.startsWith('/admin')
  const isAdminLogin = to.path === '/admin/login'
  const isStaffLogin = to.path === '/login'

  const { user, isSuperAdmin, syncUser } = useStaff()
  const { pendingMfaStep } = useMfa()

  // フルリロード後などセッション未解決の場合は同期（localStorage → Supabase 確認）
  if (!user.value) {
    await syncUser()
  }

  // 未ログイン
  if (!user.value) {
    if (isAdminPath && !isAdminLogin) return navigateTo('/admin/login')
    if (!isAdminPath && !isStaffLogin) return navigateTo('/login')
    return
  }

  // 二段階認証（全員必須）が済んでいなければ、登録または確認の画面へ
  const mfaStep = await pendingMfaStep()
  if (mfaStep) {
    if (to.path !== MFA_PATHS[mfaStep]) return navigateTo(MFA_PATHS[mfaStep])
    return
  }
  if (Object.values(MFA_PATHS).includes(to.path)) {
    return navigateTo(isSuperAdmin.value ? '/admin/stores' : '/dashboard')
  }

  // super_admin のアクセス制御
  if (isSuperAdmin.value) {
    if (isStaffLogin || isAdminLogin) return navigateTo('/admin/stores')
    if (!isAdminPath) return navigateTo('/admin/stores')
    return
  }

  // admin / staff のアクセス制御
  if (isStaffLogin) return navigateTo('/dashboard')
  if (isAdminPath && !isAdminLogin) return navigateTo('/dashboard')
})
