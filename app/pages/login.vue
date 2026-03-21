<script setup lang="ts">
definePageMeta({
  layout: false
})

const state = reactive({
  email: '',
  password: ''
})
const isLoading = ref(false)

const router = useRouter()
async function handleLogin() {
  console.log('Login attempt:', state.email)
  isLoading.value = true
  // Mock login delay
  await new Promise(resolve => setTimeout(resolve, 800))
  isLoading.value = false
  await navigateTo('/', { replace: true })
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
          <h1 class="text-2xl font-black text-slate-900 dark:text-white">Slate Precision</h1>
          <p class="text-slate-500 text-sm">Mobility Management SaaS</p>
        </div>
      </div>

      <!-- Login Form Card -->
      <UCard class="border-slate-200 dark:border-slate-800 shadow-xl">
        <UForm :state="state" class="space-y-6" @submit="handleLogin">
          <UFormField label="Email Address" name="email" required>
            <UInput
              v-model="state.email"
              type="email"
              placeholder="name@company.com"
              icon="i-lucide-mail"
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
            class="cursor-pointer"
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
