<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()
const { staff } = useStaff()
const { appEnv } = useRuntimeConfig().public
const isDev = appEnv === 'development'

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    toast.add({ title: 'Logout Failed', description: error.message, color: 'error' })
  } else {
    await navigateTo('/admin/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950">
    <!-- Dev environment banner -->
    <div v-if="isDev" class="w-full bg-amber-400 text-amber-950 text-xs font-bold text-center py-1 tracking-wide">
      🔧 DEVELOPMENT ENVIRONMENT
    </div>
    <!-- Top Navigation Bar -->
    <header class="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div class="flex items-center gap-3">
        <div class="size-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <UIcon name="i-lucide-shield" class="size-4 text-white" />
        </div>
        <span class="text-white font-bold text-sm">Rental System</span>
        <span class="text-slate-500 text-xs">Admin Console</span>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-slate-400 text-sm">@{{ staff?.username }}</span>
        <UButton
          data-testid="admin-logout"
          label="Logout"
          icon="i-lucide-log-out"
          variant="ghost"
          color="neutral"
          size="sm"
          class="cursor-pointer text-slate-400 hover:text-white"
          @click="handleLogout"
        />
      </div>
    </header>

    <!-- Page Content -->
    <main class="p-6">
      <slot />
    </main>
  </div>
</template>
