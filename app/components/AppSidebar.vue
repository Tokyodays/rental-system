<script setup lang="ts">
const { isAdmin, staff, fetchStaff } = useStaff()

// サイドバーでも明示的に同期を試みる（最終的な安全策）
onMounted(() => {
  fetchStaff()
})

const items = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: 'Vehicle List', icon: 'i-lucide-package', to: '/vehicles' },
  { label: 'Lending', icon: 'i-lucide-log-out', to: '/rentals/new' },
  { label: 'Return', icon: 'i-lucide-log-in', to: '/rentals/return' },
  { label: 'Customers', icon: 'i-lucide-users', to: '/customers' },
  { label: 'History', icon: 'i-lucide-history', to: '/history' }
]

const settingItem = { label: 'Settings', icon: 'i-lucide-settings', to: '/settings' }
</script>

<template>
  <aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex sticky top-0 h-screen overflow-hidden">
    <!-- Logo Section -->
    <div class="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
      <div class="size-8 bg-blue-600 rounded flex items-center justify-center text-white">
        <UIcon name="i-lucide-package" class="size-5" />
      </div>
      <div>
        <h1 class="text-base font-bold leading-tight text-slate-900 dark:text-white">Rental System</h1>
        <p class="text-xs text-slate-500">Vehicle Management</p>
      </div>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 p-4 flex flex-col gap-1 overflow-y-auto min-h-0">
      <template v-for="item in items" :key="item.label">
        <NuxtLink
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          active-class="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold"
          inactive-class="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <UIcon :name="item.icon" class="size-5" />
          {{ item.label }}
        </NuxtLink>
      </template>
    </nav>

    <!-- Footer Section (Settings) -->
    <div v-if="isAdmin || staff?.role_id === '00000000-0000-0000-0001-000000000001'" class="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <NuxtLink
        :to="settingItem.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer group"
        active-class="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold"
        inactive-class="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <UIcon :name="settingItem.icon" class="size-5 group-hover:rotate-45 transition-transform" />
        {{ settingItem.label }}
      </NuxtLink>
    </div>
  </aside>
</template>
