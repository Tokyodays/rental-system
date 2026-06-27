<script setup lang="ts">
const route = useRoute()
const isSidebarOpen = ref(false)
const { appEnv } = useRuntimeConfig().public
const isDev = appEnv === 'development'

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'Dashboard Overview'
  if (path.startsWith('/vehicles')) return 'Vehicle List'
  if (path.startsWith('/rentals/new')) return 'Lending Transaction'
  if (path.startsWith('/rentals/return')) return 'Return Transaction'
  if (path.startsWith('/customers')) return 'Customer Management'
  if (path.startsWith('/history')) return 'Transaction History'
  if (path.startsWith('/settings')) return 'Settings'
  return 'Rental System'
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-[sans-serif]">
    <!-- Dev environment banner -->
    <div v-if="isDev" class="w-full bg-amber-400 text-amber-950 text-xs font-bold text-center py-1 tracking-wide shrink-0">
      🔧 DEVELOPMENT ENVIRONMENT
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
