<script setup lang="ts">
definePageMeta({
  layout: false
})

const { t } = useI18n()
const { verifyCode } = useMfa()
const { fetchStaff, isSuperAdmin } = useStaff()
const supabase = useSupabaseClient()

const verifyError = ref('')
const isVerifying = ref(false)
const form = ref<{ clear: () => void } | null>(null)

async function handleVerify(code: string) {
  isVerifying.value = true
  verifyError.value = ''
  try {
    await verifyCode(code)
    // 二段階認証が済むと店舗の情報も読めるようになるので、取り直してから画面を切り替える
    await fetchStaff({ force: true })
    window.location.href = isSuperAdmin.value ? '/admin/stores' : '/dashboard'
  } catch {
    verifyError.value = t('mfa.invalid')
    form.value?.clear()
  } finally {
    isVerifying.value = false
  }
}

async function useOtherAccount() {
  await supabase.auth.signOut()
  window.location.href = '/login'
}
</script>

<template>
  <AuthShell>
    <div class="space-y-5">
      <div class="space-y-1">
        <h2 class="text-lg font-bold">{{ t('mfa.verify.title') }}</h2>
        <p class="text-sm text-slate-500">{{ t('mfa.verify.desc') }}</p>
      </div>
      <MfaCodeForm ref="form" :loading="isVerifying" :error="verifyError" @submit="handleVerify" />
      <p class="text-xs text-slate-500">{{ t('mfa.lost') }}</p>
    </div>

    <template #footer>
      <div class="text-center">
        <UButton :label="t('mfa.other_account')" variant="link" color="neutral" size="xs" class="cursor-pointer" @click="useOtherAccount" />
      </div>
    </template>
  </AuthShell>
</template>
