export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()

  // 未ログインユーザーが /login 以外のページにアクセスした場合、/login へリダイレクト
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // ログイン済みユーザーが /login にアクセスした場合、トップページ (/) へリダイレクト
  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
})
