<script setup lang="ts">
// Supabase からの読み込みが少し長引いたとき（0.3 秒以上）だけ、画面中央にローディングを出す。
// 一瞬で終わる読み込みでちらつかないよう遅らせて表示し、操作は妨げない（pointer-events-none）
const SHOW_DELAY_MS = 300

const pending = useState('supabase-pending-reads', () => 0)
const { t } = useI18n()
const visible = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null

watch(pending, (count) => {
  if (count > 0) {
    if (!visible.value && !timer) {
      timer = setTimeout(() => {
        timer = null
        visible.value = pending.value > 0
      }, SHOW_DELAY_MS)
    }
  } else {
    if (timer) clearTimeout(timer)
    timer = null
    visible.value = false
  }
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-150"
    leave-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      data-testid="loading-overlay"
      role="status"
      aria-live="polite"
      class="fixed inset-0 z-40 flex items-center justify-center pointer-events-none print:hidden"
    >
      <div class="flex flex-col items-center gap-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 px-8 py-6 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
        <UIcon name="i-lucide-loader-2" class="size-10 animate-spin text-blue-600" />
        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ t('loading') }}</p>
      </div>
    </div>
  </Transition>
</template>
