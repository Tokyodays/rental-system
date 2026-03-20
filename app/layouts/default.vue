<script setup lang="ts">
const route = useRoute()
const isSidebarOpen = ref(false)

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/') return 'Dashboard Overview'
  if (path.startsWith('/vehicles')) return 'Vehicle List'
  if (path.startsWith('/rentals/new')) return 'Lending Transaction'
  if (path.startsWith('/rentals/return')) return 'Return Transaction'
  if (path.startsWith('/customers')) return 'Customer Management'
  if (path.startsWith('/history')) return 'Transaction History'
  return 'Rental System'
})
</script>

<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-[sans-serif]">
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
</template>

<style>
/* Global styles for Slate Precision */
body {
  font-family: sans-serif;
}
</style>
