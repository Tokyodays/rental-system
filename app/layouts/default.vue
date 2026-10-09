<script setup lang="ts">
const route = useRoute()
const isSidebarOpen = ref(false)
const { appEnv } = useRuntimeConfig().public
const isDev = appEnv === 'development'

const { t } = useI18n()

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard') return t('title.dashboard')
  if (path.startsWith('/vehicles')) return t('title.vehicles')
  if (path.startsWith('/rentals/new')) return t('title.lending')
  if (path.startsWith('/rentals/return')) return t('title.return')
  if (path.startsWith('/customers')) return t('title.customers')
  if (path.startsWith('/history')) return t('title.history')
  if (path.startsWith('/settings')) return t('settings')
  if (path.startsWith('/howtouse')) return t('howtouse')
  return t('title.app')
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-[sans-serif]">
    <!-- Dev environment banner -->
    <div v-if="isDev" class="w-full bg-amber-400 text-amber-950 text-xs font-bold text-center py-1 tracking-wide shrink-0">
      {{ t('dev_banner') }}
    </div>
    <div class="flex flex-1 min-h-0">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Mobile Sidebar (Drawer) -->
    <USlideover v-model:open="isSidebarOpen" side="left" class="md:hidden">
      <template #body>
        <div class="p-4">
          <AppSidebar class="!flex !w-full border-r-0 h-full" />
        </div>
      </template>
    </USlideover>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0">
      <AppTopbar :title="pageTitle" @toggle-sidebar="isSidebarOpen = true" />

      <main class="flex-1 p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
    </div>
  </div>
</template>

<style>
/* Global styles for Slate Precision */
body {
  font-family: sans-serif;
}
</style>
