<script setup lang="ts">
// 認証アプリの6桁のコードを入力するフォーム。6桁そろったら自動で送信する
defineProps<{ loading?: boolean, error?: string }>()
const emit = defineEmits<{ submit: [code: string] }>()
const { t } = useI18n()

const code = ref('')

function onInput(value: string) {
  code.value = value.replace(/\D/g, '').slice(0, 6)
  if (code.value.length === 6) emit('submit', code.value)
}

function onSubmit() {
  if (code.value.length === 6) emit('submit', code.value)
}

defineExpose({ clear: () => { code.value = '' } })
</script>

<template>
  <form class="space-y-4" @submit.prevent="onSubmit">
    <UFormField :label="t('mfa.code')" name="code" :error="error || undefined">
      <UInput
        :model-value="code"
        data-testid="mfa-code"
        inputmode="numeric"
        autocomplete="one-time-code"
        placeholder="123456"
        maxlength="6"
        size="xl"
        icon="i-lucide-key-round"
        class="w-full"
        :ui="{ base: 'tracking-[0.4em] font-mono text-lg' }"
        autofocus
        @update:model-value="(v) => onInput(String(v ?? ''))"
      />
    </UFormField>
    <UButton
      :label="t('mfa.submit')"
      type="submit"
      color="primary"
      block
      size="lg"
      class="cursor-pointer font-bold"
      :loading="loading"
      :disabled="code.length !== 6"
    />
  </form>
</template>
