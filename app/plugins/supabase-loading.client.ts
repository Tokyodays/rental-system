/**
 * Supabase からの読み込み（GET）が進行中の件数を数え、画面中央のローディング表示（AppLoadingOverlay）に使う。
 * supabase-js は呼び出しのたびに globalThis.fetch を参照するため、ここで包めばすべての読み込みを数えられる。
 * 保存（POST / PATCH など）はボタン側でローディングを出しているので数えない。
 */
export default defineNuxtPlugin(() => {
  const pending = useState('supabase-pending-reads', () => 0)
  const supabaseUrl = useRuntimeConfig().public.supabase?.url as string | undefined
  if (!supabaseUrl) return

  const originalFetch = window.fetch.bind(window)
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
    const isRead = method === 'GET' && url.startsWith(supabaseUrl) && /\/(rest|auth)\/v1\//.test(url)
    if (!isRead) return originalFetch(input, init)

    pending.value++
    try {
      return await originalFetch(input, init)
    } finally {
      pending.value--
    }
  }
})
