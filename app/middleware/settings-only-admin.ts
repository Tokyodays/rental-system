/**
 * Settingsページのアクセス制限
 * adminロールのユーザーのみアクセス可能
 */
export default defineNuxtRouteMiddleware(async () => {
  const { isAdmin, fetchStaff } = useStaff()

  // staffデータが未ロードの場合は取得する
  await fetchStaff()

  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
