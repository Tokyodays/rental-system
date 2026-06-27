export default defineNuxtRouteMiddleware(async () => {
  const { isSuperAdmin, syncUser } = useStaff()
  // auth.global.ts 後だが、直接アクセス時のために念のため同期
  if (!isSuperAdmin.value) {
    await syncUser()
  }
  if (!isSuperAdmin.value) {
    return navigateTo('/dashboard')
  }
})
