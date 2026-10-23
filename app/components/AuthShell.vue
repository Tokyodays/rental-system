<script setup lang="ts">
// ログイン前後の画面（二段階認証の登録・確認）の共通の枠。ログイン画面と同じ見た目にする
const { appEnv } = useRuntimeConfig().public
const isDev = appEnv === 'development'
const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
    <div v-if="isDev" class="w-full bg-amber-400 text-amber-950 text-xs font-bold text-center py-1 tracking-wide shrink-0">
      {{ t('dev_banner') }}
    </div>
    <div class="flex-1 flex items-center justify-center p-6">
      <div class="w-full max-w-sm space-y-8">
        <div class="flex flex-col items-center gap-4">
          <div class="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <UIcon name="i-lucide-shield-check" class="size-8" />
          </div>
          <div class="text-center">
            <h1 class="text-2xl font-black text-slate-900 dark:text-white">Rental System</h1>
            <p class="text-slate-500 text-sm">{{ t('auth.subtitle') }}</p>
          </div>
        </div>
        <UCard class="border-slate-200 dark:border-slate-800 shadow-xl">
          <slot />
        </UCard>
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
