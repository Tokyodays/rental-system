/**
 * Settingsページのアクセス制限
 * adminロールのユーザーのみアクセス可能
 */
export default defineNuxtRouteMiddleware(async () => {
  const { isAdmin, isSuperAdmin, syncUser } = useStaff()

  await syncUser()

  // super_admin はレンタル画面（settings含む）にアクセスしない → 管理コンソールへ
  if (isSuperAdmin.value) {
    return navigateTo('/admin/stores')
  }

  if (!isAdmin.value) {
    return navigateTo('/dashboard')
  }
})
