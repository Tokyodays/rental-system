<script setup lang="ts">
const supabase = useSupabaseClient()
const search = ref('')
const rentals = ref<any[]>([])
const isLoading = ref(true)

const { data, refresh } = await useAsyncData('rentals-history', async () => {
  const { data } = await (supabase
    .from('rentals')
    .select('*, vehicles(name, code), customers(full_name)')
    .order('start_at', { ascending: false }) as any)
  return data || []
})

rentals.value = data.value || []
isLoading.value = false

const transactionEvents = computed(() => {
  const events: any[] = []
  
  rentals.value.forEach(r => {
    // Always add a 'Lend' event
    events.push({
      id: `${r.id}-L`,
      rentalId: r.id,
      type: 'Lend',
      date: r.start_at,
      vehicle: r.vehicles,
      customer: r.customers,
      status: r.status // Overall rental status
    })
    
    // Add 'Return' event if completed
    if (r.status === 'Completed' && r.end_at) {
      events.push({
        id: `${r.id}-R`,
        rentalId: r.id,
        type: 'Return',
        date: r.end_at,
        vehicle: r.vehicles,
        customer: r.customers,
        status: 'Completed'
      })
    }
  })
  
  // Sort all events by date desc
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const filteredTransactions = computed(() => {
  if (!search.value) return transactionEvents.value
  const q = search.value.toLowerCase()
  return transactionEvents.value.filter(t => 
    t.vehicle?.name?.toLowerCase().includes(q) || 
    t.vehicle?.code?.toLowerCase().includes(q) ||
    t.customer?.full_name?.toLowerCase().includes(q) ||
    t.type.toLowerCase().includes(q)
  )
})

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-2xl font-bold font-heading">Transaction History</h1>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <UInput
          v-model="search"
          placeholder="Search items or users..."
          icon="i-lucide-search"
          class="flex-1 sm:w-64"
        />
        <UButton label="Export" icon="i-lucide-download" variant="outline" color="neutral" class="cursor-pointer" />
      </div>
    </div>

    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" :ui="{ body: 'p-0' }">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead class="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Item</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">User</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Type</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
          <tr v-if="isLoading" v-for="i in 5" :key="i">
             <td v-for="j in 5" :key="j" class="px-6 py-4"><div class="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-24"></div></td>
          </tr>
          <tr v-else v-for="t in filteredTransactions" :key="t.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td class="px-6 py-4 text-[10px] font-mono text-slate-400">#{{ t.rentalId.split('-')[0] }}</td>
            <td class="px-6 py-4">
              <p class="font-bold text-slate-900 dark:text-white">{{ t.vehicle?.name }}</p>
              <p class="text-xs text-slate-500">{{ t.vehicle?.code }}</p>
            </td>
            <td class="px-6 py-4 text-sm font-medium">{{ t.customer?.full_name }}</td>
            <td class="px-6 py-4">
               <UBadge 
                 :label="t.type === 'Lend' ? 'Lending' : 'Returned'" 
                 :color="t.type === 'Lend' ? 'info' : 'success'" 
                 variant="subtle"
                 class="font-bold"
               />
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
               {{ formatDate(t.date) }}
            </td>
          </tr>
          <tr v-if="!isLoading && filteredTransactions.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-slate-500">
              No transactions found.
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </div>
</template>
