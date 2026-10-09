<script setup lang="ts">
const { connectionError, checkConnection } = useSupabaseConnection()
</script>

<template>
  <UApp>
    <NuxtRouteAnnouncer />
    
    <!-- Supabase 接続エラー通知 -->
    <div v-if="connectionError.isError" class="fixed top-0 left-0 right-0 z-[9999] p-4 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 text-red-700 dark:text-red-400">
          <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 flex-shrink-0" />
          <p class="text-sm font-medium">
            {{ connectionError.message }}
          </p>
        </div>
        <UButton
          size="xs"
          color="error"
          variant="soft"
          icon="i-lucide-refresh-cw"
          label="再試行"
          @click="checkConnection"
        />
      </div>
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<style scoped>
/* エラー表示中にコンテンツが隠れないように調整（必要に応じて） */
.v-enter-active, .v-leave-active {
  transition: opacity 0.3s ease;
}
.v-enter-from, .v-leave-to {
  opacity: 0;
}
</style>
