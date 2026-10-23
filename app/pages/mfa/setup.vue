<script setup lang="ts">
definePageMeta({
  layout: false
})

const { t } = useI18n()
const { startEnrollment, verifyCode } = useMfa()
const { fetchStaff, isSuperAdmin } = useStaff()
const supabase = useSupabaseClient()

const enrollment = ref<{ factorId: string, qrCode: string, secret: string } | null>(null)
const loadError = ref('')
const verifyError = ref('')
const isVerifying = ref(false)
const form = ref<{ clear: () => void } | null>(null)

onMounted(async () => {
  try {
    enrollment.value = await startEnrollment()
  } catch (e: any) {
    loadError.value = e.message
  }
})

async function handleVerify(code: string) {
  if (!enrollment.value) return
  isVerifying.value = true
  verifyError.value = ''
  try {
    await verifyCode(code, enrollment.value.factorId)
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
        <h2 class="text-lg font-bold">{{ t('mfa.setup.title') }}</h2>
        <p class="text-sm text-slate-500">{{ t('mfa.setup.desc') }}</p>
      </div>

      <UAlert v-if="loadError" color="error" variant="subtle" icon="i-lucide-alert-circle" :title="loadError" />

      <div v-else-if="!enrollment" class="flex justify-center py-10">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-slate-400" />
      </div>

      <template v-else>
        <div class="flex justify-center">
          <img :src="enrollment.qrCode" alt="QR code" data-testid="mfa-qr" class="size-48 rounded-lg bg-white p-2 ring-1 ring-slate-200">
        </div>
        <div class="space-y-1">
          <p class="text-xs text-slate-500">{{ t('mfa.setup.manual') }}</p>
          <p data-testid="mfa-secret" class="font-mono text-sm break-all select-all rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2">{{ enrollment.secret }}</p>
        </div>
        <MfaCodeForm ref="form" :loading="isVerifying" :error="verifyError" @submit="handleVerify" />
      </template>
    </div>

    <template #footer>
      <div class="text-center">
        <UButton :label="t('mfa.other_account')" variant="link" color="neutral" size="xs" class="cursor-pointer" @click="useOtherAccount" />
      </div>
    </template>
  </AuthShell>
</template>
