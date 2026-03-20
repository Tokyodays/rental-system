<script setup lang="ts">
const vehicleId = ref('MBP-2023-042') // Pre-filled if from scanner
const customerId = ref('')
const startMileage = ref(1240)

const customers = [
  { id: '1', name: 'Jane Cooper' },
  { id: '2', name: 'Cody Fisher' }
]

const router = useRouter()
function startRental() {
  // Logic to create rental record
  router.push('/rentals/success')
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" @click="router.back()" />
      <h1 class="text-2xl font-bold">New Lending Transaction</h1>
    </div>

    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
      <template #header>
        <p class="font-bold text-slate-900 dark:text-white">Transaction Details</p>
      </template>

      <UForm class="space-y-6" @submit="startRental">
        <UFormField label="Vehicle ID" name="vehicleId" required>
          <UInput v-model="vehicleId" disabled icon="i-lucide-package" />
        </UFormField>

        <UFormField label="Customer" name="customerId" required>
          <USelectMenu
            v-model="customerId"
            :options="customers"
            value-attribute="id"
            option-attribute="name"
            placeholder="Search customer..."
            icon="i-lucide-users"
          />
        </UFormField>

        <UFormField label="Start Mileage (km)" name="startMileage" required>
          <UInput v-model="startMileage" type="number" icon="i-lucide-gauge" />
        </UFormField>

        <div class="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <UButton label="Cancel" variant="ghost" color="neutral" @click="router.back()" />
          <UButton label="Confirm Lending" color="primary" type="submit" size="lg" />
        </div>
      </UForm>
    </UCard>
  </div>
</template>
