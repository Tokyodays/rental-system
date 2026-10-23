<script setup lang="ts">
import { toLocale, type Locale } from '~/locales'

defineProps<{
  title: string
}>()

const emit = defineEmits(['toggle-sidebar'])

const CURRENCY_CONVERTER_URL = 'https://www.oanda.com/currency-converter/'

const supabase = useSupabaseClient()
const router = useRouter()
const toast = useToast()

const user = useSupabaseUser()
const { staff, isLoading } = useStaff()
const { t, setLocale, availableLocales } = useI18n()

const changeLocale = async (value: Locale | null) => {
  try {
    await setLocale(value)
  } catch (err: any) {
    toast.add({ title: t('error'), description: err.message, color: 'error' })
  }
}

// 自分の言語（staff.locale）を選ぶメニュー。未選択なら店舗のデフォルトに従う
const languageMenu = computed(() => {
  const personal = staff.value?.locale ?? null
  const storeDefault = availableLocales.find(l => l.value === toLocale(staff.value?.stores?.default_locale)) ?? availableLocales[0]!
  return {
    label: t('language'),
    icon: 'i-lucide-languages',
    children: [
      [{
        label: t('lang.store_default', { lang: storeDefault.label }),
        type: 'checkbox' as const,
        checked: personal === null,
        onSelect: () => changeLocale(null)
      }],
      availableLocales.map(l => ({
        label: l.label,
        type: 'checkbox' as const,
        checked: personal === l.value,
        onSelect: () => changeLocale(l.value)
      }))
    ]
  }
})

const printPage = () => window.print()

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    toast.add({ title: t('logout_failed'), description: error.message, color: 'error' })
  } else {
    toast.add({ title: t('logged_out'), description: t('logged_out_desc'), color: 'success' })
    await router.push('/login')
  }
}

const userMenuItems = computed(() => [
  [languageMenu.value],
  [
    { label: t('profile'), icon: 'i-lucide-user' },
    { label: t('logout'), icon: 'i-lucide-log-out', color: 'error' as any, onSelect: handleLogout }
  ]
])
</script>

<template>
  <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 px-4 md:px-6 sticky top-0 z-10 print:static print:px-0">
    <div class="flex items-center gap-2 md:gap-4 min-w-0">
      <UButton
        icon="i-lucide-menu"
        variant="ghost"
        color="neutral"
        class="md:hidden cursor-pointer print:hidden"
        @click="emit('toggle-sidebar')"
      />
      <h2 class="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">{{ title }}</h2>
    </div>

    <!-- 右上のボタン類は印刷しない（ページタイトルだけ残す） -->
    <div class="flex items-center gap-1 sm:gap-4 shrink-0 print:hidden">
      <UButton
        icon="i-lucide-printer"
        :label="t('print')"
        :aria-label="t('print')"
        variant="ghost"
        color="neutral"
        size="sm"
        :ui="{ label: 'hidden sm:inline' }"
        class="cursor-pointer"
        @click="printPage"
      />
      <UButton
        :to="CURRENCY_CONVERTER_URL"
        target="_blank"
        rel="noopener noreferrer"
        icon="i-lucide-arrow-left-right"
        trailing-icon="i-lucide-external-link"
        :label="t('currency_converter')"
        :aria-label="t('currency_converter')"
        variant="ghost"
        color="neutral"
        size="sm"
        :ui="{ label: 'hidden sm:inline' }"
      />
      <UDropdownMenu :items="userMenuItems">
        <div data-testid="user-menu" class="flex items-center gap-2 cursor-pointer group px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex items-center gap-2">
            <div class="animate-pulse w-20 h-4 bg-slate-100 dark:bg-slate-800 rounded hidden sm:block"></div>
            <UAvatar size="sm" class="animate-pulse opacity-50" />
          </div>

          <!-- Loaded State -->
          <template v-else>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors hidden sm:inline">
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
