<script setup lang="ts">
defineProps<{
  title: string
}>()

const emit = defineEmits(['toggle-sidebar'])

const supabase = useSupabaseClient()
const router = useRouter()
const toast = useToast()

const user = useSupabaseUser()
const { staff, isLoading } = useStaff()
const { t } = useI18n()

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    toast.add({ title: 'Logout Failed', description: error.message, color: 'error' })
  } else {
    toast.add({ title: 'Logged Out', description: 'You have been successfully logged out.', color: 'success' })
    await router.push('/login')
  }
}

const userMenuItems = computed(() => [
  [
    { label: t('profile'), icon: 'i-lucide-user' },
    { label: t('logout'), icon: 'i-lucide-log-out', color: 'error' as any, onSelect: handleLogout }
  ]
])
</script>

<template>
  <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
    <div class="flex items-center gap-4">
      <UButton
        icon="i-lucide-menu"
        variant="ghost"
        color="neutral"
        class="md:hidden cursor-pointer"
        @click="emit('toggle-sidebar')"
      />
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ title }}</h2>
    </div>

    <div class="flex items-center gap-4">
      <UDropdownMenu :items="userMenuItems">
        <div data-testid="user-menu" class="flex items-center gap-2 cursor-pointer group px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex items-center gap-2">
            <div class="animate-pulse w-20 h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
            <UAvatar size="sm" class="animate-pulse opacity-50" />
          </div>

          <!-- Loaded State -->
          <template v-else>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
              @{{ staff?.username || user?.email?.split('@')[0] || 'User' }}
            </span>
            <UAvatar
              :alt="staff?.username || 'User'"
              size="sm"
            />
          </template>
        </div>
      </UDropdownMenu>
    </div>
  </header>
</template>
