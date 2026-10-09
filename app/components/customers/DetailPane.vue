<script setup lang="ts">
import type { Customer, CustomerTransaction } from '~/utils/customer'

defineProps<{
  customer: Customer
  transactions: CustomerTransaction[]
  isLoadingTransactions: boolean
}>()

const emit = defineEmits<{
  close: []
  edit: [customer: Customer]
  delete: [customer: Customer]
}>()

const { getPassportPublicUrl } = useCustomerPassport()
</script>

<template>
  <aside
    class="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto hidden lg:flex"
  >
    <div class="p-6 flex flex-col h-full space-y-6">
      <div class="flex items-start justify-between">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Customer Profile</h3>
        <UButton
          icon="i-lucide-x"
          variant="ghost"
          color="neutral"
          class="cursor-pointer"
          @click="emit('close')"
        />
      </div>

      <!-- Passport Image Display -->
      <div class="flex flex-col items-center">
        <div class="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-4 border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-sm">
          <template v-if="customer.passport_url">
            <img 
              :src="getPassportPublicUrl(customer.passport_url)" 
              class="w-full h-full object-cover" 
              @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Load+Error'"
            />
          </template>
          <div v-else class="flex flex-col items-center gap-2">
             <UIcon name="i-lucide-user" class="text-6xl text-slate-300" />
             <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Passport Photo</p>
          </div>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white text-center">{{ customer.full_name }}</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">{{ customer.email }}</p>
        
        <UBadge
          v-if="customer.customer_statuses"
          :label="customer.customer_statuses.name"
          :color="customer.customer_statuses.color as any"
          variant="subtle"
          class="rounded-full px-4"
        />
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3">
        <UButton
          label="Edit Info"
          icon="i-lucide-pencil"
          color="neutral"
          variant="subtle"
          block
          class="cursor-pointer font-bold"
          @click="emit('edit', customer)"
        />
        <UButton
          label="Delete"
          icon="i-lucide-trash-2"
          color="error"
          variant="subtle"
          block
          class="cursor-pointer font-bold"
          @click="emit('delete', customer)"
        />
      </div>

      <div class="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-y-4 gap-x-2">
          <div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Phone Number</p>
            <p class="text-sm text-slate-900 dark:text-white font-medium">{{ customer.phone || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Passport Number</p>
            <p class="text-sm font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">{{ customer.passport_number || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Registered At</p>
            <p class="text-sm text-slate-900 dark:text-white font-medium">{{ new Date(customer.created_at).toLocaleDateString() }}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">ID</p>
            <p class="text-xs font-mono text-slate-400 truncate">{{ customer.id.split('-')[0] }}...</p>
          </div>
        </div>

        <!-- Rental History -->
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UIcon name="i-lucide-history" class="size-4" />
              Rental History
            </h4>
            <UBadge :label="`${transactions.length}`" color="neutral" variant="subtle" size="xs" />
          </div>

          <div v-if="isLoadingTransactions" class="flex flex-col items-center py-4 space-y-2">
             <UIcon name="i-lucide-loader-2" class="size-5 animate-spin text-slate-400" />
             <p class="text-[10px] text-slate-500">Loading history...</p>
          </div>
          <div v-else-if="transactions.length === 0" class="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
             <p class="text-xs text-slate-400">No rental records found.</p>
          </div>
          <div v-else class="space-y-3 max-h-[300px] overflow-y-auto pr-1">
             <div v-for="t in transactions" :key="t.id" class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-colors">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                     <UIcon :name="t.vehicles?.vehicle_categories?.icon || 'i-lucide-package'" class="size-3.5 text-blue-500" />
                     <p class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{{ t.vehicles?.name }}</p>
                  </div>
                  <span :class="['text-[10px] px-1.5 py-0.5 rounded-full font-bold', t.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300']">
                    {{ t.status }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-[10px]">
                  <p class="text-slate-500">{{ new Date(t.start_at).toLocaleDateString() }}</p>
                  <p class="font-bold text-blue-600 dark:text-blue-400">{{ t.price }}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
