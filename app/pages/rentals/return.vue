<script setup lang="ts">
const vehicleId = ref('MBP-2023-042')
const endMileage = ref(1265)
const startMileage = 1240
const diff = computed(() => (endMileage.value || 0) - startMileage)

const router = useRouter()
function confirmReturn() {
  router.push('/rentals/success')
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" class="cursor-pointer" @click="router.back()" />
      <h1 class="text-2xl font-bold">Return Transaction</h1>
    </div>

    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
      <template #header>
        <p class="font-bold text-slate-900 dark:text-white">Equipment Information</p>
      </template>

      <div class="space-y-6">
        <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
           <div class="size-12 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800">
             <UIcon name="i-lucide-package" class="size-6 text-blue-600" />
           </div>
           <div>
             <p class="text-sm text-slate-500 font-medium">Lent Item</p>
             <p class="font-bold text-slate-900 dark:text-white">MacBook Pro 16"</p>
             <p class="text-xs font-mono text-slate-400">MBP-2023-042</p>
           </div>
        </div>

        <UForm class="space-y-6" @submit="confirmReturn">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Start Mileage" name="start">
              <UInput :modelValue="startMileage" disabled variant="subtle" />
            </UFormField>
            <UFormField label="End Mileage (km)" name="end" required>
              <UInput v-model="endMileage" type="number" color="primary" />
            </UFormField>
          </div>

          <div v-if="diff > 0" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex justify-between items-center border border-blue-100 dark:border-blue-800/50">
            <p class="text-sm text-blue-700 dark:text-blue-300 font-medium">Distance Traveled</p>
            <p class="text-xl font-black text-blue-800 dark:text-blue-200">{{ diff }} km</p>
          </div>

          <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <UButton label="Cancel" variant="ghost" color="neutral" class="cursor-pointer" @click="router.back()" />
            <UButton label="Confirm Return" color="primary" type="submit" size="lg" class="cursor-pointer" />
          </div>
        </UForm>
      </div>
    </UCard>
  </div>
</template>
