<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="max-w-md mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-160px)] text-center space-y-8">
    <div class="size-24 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center shadow-sm border border-green-200 dark:border-green-800/50">
      <UIcon name="i-lucide-check" class="size-12" />
    </div>

    <div class="space-y-2">
      <h1 class="text-3xl font-black text-slate-900 dark:text-white">Transaction Success</h1>
      <p class="text-slate-500">The transaction has been processed and recorded successfully.</p>
    </div>

    <UCard class="w-full border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-800/50">
      <div class="space-y-4 text-left text-sm">
        <div class="flex justify-between">
          <span class="text-slate-500 font-medium">Transaction ID</span>
          <span class="font-mono font-bold text-slate-900 dark:text-white">TXN-8829-001</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500 font-medium">Timestamp</span>
          <span class="font-bold text-slate-900 dark:text-white">Oct 25, 2023 10:45 AM</span>
        </div>
        <div class="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between">
          <span class="text-slate-500 font-medium">Status</span>
          <UBadge label="Completed" color="success" variant="subtle" />
        </div>
      </div>
    </UCard>

    <div class="flex flex-col gap-3 w-full">
      <UButton
        label="Return to Dashboard"
        block
        color="primary"
        size="lg"
        to="/"
        class="cursor-pointer"
      />
      <UButton
        label="View History"
        block
        color="neutral"
        variant="ghost"
        to="/history"
        class="cursor-pointer"
      />
    </div>
  </div>
</template>
