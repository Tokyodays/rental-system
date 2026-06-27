export default defineNuxtRouteMiddleware(async (to) => {
  // Landing page is public
  if (to.path === '/') return

  const isAdminPath = to.path.startsWith('/admin')
  const isAdminLogin = to.path === '/admin/login'
  const isStaffLogin = to.path === '/login'

  const { user, isSuperAdmin, syncUser } = useStaff()

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
