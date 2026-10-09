<script setup lang="ts">
import { toInternalEmail } from '#shared/constants/auth'

definePageMeta({
  layout: false
})

const state = reactive({
  username: '',
  password: ''
})
const isLoading = ref(false)
const { appEnv } = useRuntimeConfig().public
const isDev = appEnv === 'development'

const supabase = useSupabaseClient()
const toast = useToast()
const { syncUser, isSuperAdmin } = useStaff()
const { t } = useI18n()

async function handleLogin() {
  // バリデーション: 英数字のみ
  if (!/^[a-zA-Z0-9]+$/.test(state.username)) {
    toast.add({ title: t('auth.invalid_username'), description: t('auth.username_alnum'), color: 'error' })
    return
  }

  isLoading.value = true
  
  try {
    // ユーザー名を内部的なメールアドレス形式に変換
    const internalEmail = toInternalEmail(state.username)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password: state.password
    })

    if (error) throw error
    if (!data.session) throw new Error(t('auth.session_failed'))

    toast.add({ title: t('auth.welcome'), description: t('auth.logged_in'), color: 'success' })

    // ロールを同期してリダイレクト先を分岐（window.location で完全リロード→競合状態を回避）
    await syncUser()
    setTimeout(() => {
      window.location.href = isSuperAdmin.value ? '/admin/stores' : '/dashboard'
    }, 100)
  } catch (error: any) {
    console.error('Login error:', error)
    const errorMsg = error.message === 'Invalid login credentials' ? t('auth.bad_credentials') : error.message
    toast.add({ title: t('auth.login_failed'), description: errorMsg, color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
    <div v-if="isDev" class="w-full bg-amber-400 text-amber-950 text-xs font-bold text-center py-1 tracking-wide shrink-0">
      {{ t('dev_banner') }}
    </div>
  <div class="flex-1 flex items-center justify-center p-6">
    <div class="w-full max-w-sm space-y-8">
      <!-- Logo -->
      <div class="flex flex-col items-center gap-4">
        <div class="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <UIcon name="i-lucide-package" class="size-8" />
        </div>
        <div class="text-center">
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Rental System</h1>
          <p class="text-slate-500 text-sm">{{ t('auth.subtitle') }}</p>
        </div>
      </div>

      <!-- Login Form Card -->
      <UCard class="border-slate-200 dark:border-slate-800 shadow-xl">
        <UForm :state="state" class="space-y-6" @submit="handleLogin">
          <UFormField :label="t('auth.username_label')" name="username" required>
            <UInput
              v-model="state.username"
              placeholder="admin"
              icon="i-lucide-user"
              size="md"
            />
          </UFormField>

          <UFormField :label="t('password')" name="password" required>
            <UInput
              v-model="state.password"
              type="password"
              placeholder="••••••••"
              icon="i-lucide-lock"
              size="md"
            />
          </UFormField>

          <UButton
            :label="t('auth.sign_in')"
            type="submit"
            color="primary"
            block
            size="lg"
            class="cursor-pointer font-bold"
            :loading="isLoading"
          />

          <div class="text-center">
             <UButton :label="t('auth.forgot')" variant="link" color="neutral" size="xs" class="cursor-pointer" />
          </div>
        </UForm>
      </UCard>

      <p class="text-center text-xs text-slate-400">
        {{ t('auth.rights') }}
      </p>
    </div>
  </div>
  </div>
</template>
