<script setup lang="ts">
definePageMeta({
  layout: false
})

const state = reactive({
  username: '',
  password: ''
})
const isLoading = ref(false)

const router = useRouter()
const supabase = useSupabaseClient()
const toast = useToast()

async function handleLogin() {
  // バリデーション: 英数字のみ
  if (!/^[a-zA-Z0-9]+$/.test(state.username)) {
    toast.add({ title: 'Invalid Username', description: 'Username must be alphanumeric.', color: 'error' })
    return
  }

  isLoading.value = true
  
  try {
    // ユーザー名を内部的なメールアドレス形式に変換
    const internalEmail = `${state.username.toLowerCase()}@rental.local`

    const { data, error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password: state.password
    })

    if (error) throw error

    if (!data.session) {
      throw new Error('Login failed: Session not created.')
    }

    toast.add({ title: 'Welcome', description: 'Successfully logged in.', color: 'success' })
    
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
  } catch (error: any) {
    console.error('Login error:', error)
    const errorMsg = error.message === 'Invalid login credentials' ? 'ユーザー名またはパスワードが正しくありません' : error.message
    toast.add({ title: 'Login Failed', description: errorMsg, color: 'error' })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
    <div class="w-full max-w-sm space-y-8">
      <!-- Logo -->
      <div class="flex flex-col items-center gap-4">
        <div class="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <UIcon name="i-lucide-package" class="size-8" />
        </div>
        <div class="text-center">
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Rental System</h1>
          <p class="text-slate-500 text-sm">Mobility Management SaaS</p>
        </div>
      </div>

      <!-- Login Form Card -->
      <UCard class="border-slate-200 dark:border-slate-800 shadow-xl">
        <UForm :state="state" class="space-y-6" @submit="handleLogin">
          <UFormField label="Username (英数字)" name="username" required>
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
            label="Sign In"
            type="submit"
            color="primary"
            block
            size="lg"
            class="cursor-pointer font-bold"
            :loading="isLoading"
          />

          <div class="text-center">
             <UButton label="Forgot password?" variant="link" color="neutral" size="xs" class="cursor-pointer" />
          </div>
        </UForm>
      </UCard>

      <p class="text-center text-xs text-slate-400">
        &copy; 2026 Slate Precision. All rights reserved.
      </p>
    </div>
  </div>
</template>
