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

async function handleLogin() {
  if (!/^[a-zA-Z0-9]+$/.test(state.username)) {
    toast.add({ title: 'Invalid Username', description: 'Username must be alphanumeric.', color: 'error' })
    return
  }

  isLoading.value = true

  try {
    const internalEmail = toInternalEmail(state.username)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password: state.password
    })

    if (error) throw error
    if (!data.session) throw new Error('Login failed: Session not created.')

    // ロール確認
    await syncUser()

    if (!isSuperAdmin.value) {
      // super_admin 以外はログアウトしてエラー
      await supabase.auth.signOut()
      toast.add({
        title: 'Access Denied',
        description: 'このページはオーナーアカウント専用です。',
        color: 'error'
      })
      return
    }

    toast.add({ title: 'Welcome', description: 'Admin console へようこそ。', color: 'success' })
    setTimeout(() => { window.location.href = '/admin/stores' }, 100)
  } catch (error: any) {
    console.error('Admin login error:', error)
    const errorMsg = error.message === 'Invalid login credentials'
      ? 'ユーザー名またはパスワードが正しくありません'
      : error.message
    toast.add({ title: 'Login Failed', description: errorMsg, color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-900">
    <div v-if="isDev" class="w-full bg-amber-400 text-amber-950 text-xs font-bold text-center py-1 tracking-wide shrink-0">
      🔧 DEVELOPMENT ENVIRONMENT
    </div>
  <div class="flex-1 flex items-center justify-center p-6">
    <div class="w-full max-w-sm space-y-8">
      <!-- Logo -->
      <div class="flex flex-col items-center gap-4">
        <div class="size-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <UIcon name="i-lucide-shield" class="size-8" />
        </div>
        <div class="text-center">
          <h1 class="text-2xl font-black text-white">Admin Console</h1>
          <p class="text-slate-400 text-sm">Rental System — Owner Portal</p>
        </div>
      </div>

      <!-- Login Form Card -->
      <UCard class="border-slate-700 bg-slate-800 shadow-xl">
        <UForm :state="state" class="space-y-6" @submit="handleLogin">
          <UFormField label="Username" name="username" required>
            <UInput
              v-model="state.username"
              placeholder="admin"
              icon="i-lucide-user"
              size="md"
            />
          </UFormField>

          <UFormField label="Password" name="password" required>
            <UInput
              v-model="state.password"
              type="password"
              placeholder="••••••••"
              icon="i-lucide-lock"
              size="md"
            />
          </UFormField>

          <UButton
            label="Sign In to Admin Console"
            type="submit"
            color="primary"
            block
            size="lg"
            class="cursor-pointer font-bold"
            :loading="isLoading"
          />
        </UForm>
      </UCard>

      <p class="text-center text-xs text-slate-500">
        Staff login: <NuxtLink to="/login" class="text-slate-400 hover:text-white underline">/login</NuxtLink>
      </p>

      <p class="text-center text-xs text-slate-600">
        &copy; 2026 Slate Precision. All rights reserved.
      </p>
    </div>
  </div>
  </div>
</template>
