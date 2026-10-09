<script setup lang="ts">
const supabase = useSupabaseClient()
const { formatPrice } = useCurrency()
const { t, dateLocale } = useI18n()
const search = ref('')

const { data, pending } = await useAsyncData('transactions-history', async () => {
  const { data } = await (supabase
    .from('transactions')
    .select('*, vehicles(name, code), customers(full_name)')
    .order('start_at', { ascending: false }) as any)
  return data || []
})

const rentals = computed(() => data.value || [])

function calculateDurationText(startStr: string, endStr: string) {
  if (!startStr || !endStr) return ''
  const start = new Date(startStr)
  const end = new Date(endStr)
  const diffMs = end.getTime() - start.getTime()
  if (diffMs < 0) return ''

  const { days, hours } = diffToDaysHours(diffMs)

  if (days > 0 && hours > 0) return t('duration.short_dh', { d: days, h: hours })
  if (days > 0) return t('duration.short_d', { d: days })
  return t('duration.short_h', { h: hours })
}

const transactionEvents = computed(() => {
  // Directly map each transaction to its summary format as requested
  // ID, Item, User, Lending Time, Returned Time, Duration, Price
  return rentals.value.map(r => ({
    id: r.id,
    transactionId: r.id,
    vehicle: r.vehicles,
    customer: r.customers,
    lendingTime: r.start_at,
    returnedTime: r.status === 'Completed' ? r.end_at : null,
    duration: r.status === 'Completed' && r.end_at ? calculateDurationText(r.start_at, r.end_at) : null,
    price: r.price,
    status: r.status,
    expectedReturnTime: r.end_at // end_at stores the expected return date for active rentals
  })).sort((a, b) => new Date(b.lendingTime).getTime() - new Date(a.lendingTime).getTime())
})

const statusFilter = ref('All')
const monthFilter = ref(new Date().toISOString().substring(0, 7)) // Default to current month (YYYY-MM)

const availableMonths = computed(() => {
  const months = new Set<string>()
  transactionEvents.value.forEach(t => {
    if (t.lendingTime) {
      months.add(new Date(t.lendingTime).toISOString().substring(0, 7))
    }
  })
  
  const currentMonth = new Date().toISOString().substring(0, 7)
  months.add(currentMonth)
  
  return Array.from(months).sort().reverse().map(m => ({
    label: m,
    value: m
  }))
})

const filteredTransactions = computed(() => {
  let filtered = transactionEvents.value

  // Search filter
  if (search.value) {
    const q = search.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.vehicle?.name?.toLowerCase().includes(q) || 
      t.vehicle?.code?.toLowerCase().includes(q) ||
      t.customer?.full_name?.toLowerCase().includes(q)
    )
  }

  // Month Filter (based on lendingTime)
  if (monthFilter.value) {
    filtered = filtered.filter(t => {
      if (!t.lendingTime) return false
      return t.lendingTime.startsWith(monthFilter.value)
    })
  }

  return filtered
})

const displayedTotal = computed(() => {
  const uniqueIds = new Set(filteredTransactions.value.map(t => t.transactionId))
  let sum = 0
  uniqueIds.forEach(id => {
    const r = rentals.value.find(r => r.id === id)
    if (r && r.price) sum += Number(r.price)
  })
  return sum
})

const toast = useToast()
const isExportModalOpen = ref(false)

const getInitialDates = () => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  const format = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  
  return { start: format(firstDay), end: format(lastDay) }
}

const initialDates = getInitialDates()
const exportStartDate = ref(initialDates.start)
const exportEndDate = ref(initialDates.end)

function downloadExport() {
  if (!exportStartDate.value || !exportEndDate.value) {
    toast.add({ title: t('error'), description: t('hist.export.need_dates'), color: 'error' })
    return
  }

  const start = new Date(exportStartDate.value)
  const end = new Date(exportEndDate.value)
  end.setHours(23, 59, 59, 999) // Include the end date entirely

  const dataToExport = transactionEvents.value.filter(t => {
    const d = new Date(t.lendingTime)
    return d >= start && d <= end
  })

  if (dataToExport.length === 0) {
    toast.add({ title: t('hist.export.no_data'), description: t('hist.export.no_data_desc'), color: 'warning' })
    return
  }

  // Create CSV
  const headers = ['hist.col.id', 'hist.col.item', 'hist.col.user', 'hist.col.lending', 'hist.col.returned', 'hist.col.duration', 'hist.col.price'].map(k => t(k))
  const rows = dataToExport.map(t => [
    `#${t.transactionId.split('-')[0]}`,
    t.vehicle?.name || '',
    t.customer?.full_name || '',
    formatDate(t.lendingTime),
    t.returnedTime ? formatDate(t.returnedTime) : '-',
    t.duration || '-',
    t.price || 0
  ])

  const csvContent = [
    // Include BOM for Excel to properly read UTF-8
    '\uFEFF' + headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `transactions_${exportStartDate.value}_to_${exportEndDate.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  isExportModalOpen.value = false
  toast.add({ title: t('success'), description: t('hist.export.done_desc'), color: 'success' })
}

function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleString(dateLocale.value, {
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
    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <UInput
          v-model="search"
          :placeholder="t('hist.search')"
          icon="i-lucide-search"
          class="w-full sm:w-64"
        />
        
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500 uppercase">{{ t('hist.month') }}</span>
          <USelect
            v-model="monthFilter"
            :items="availableMonths"
            class="w-40"
          />
        </div>
      </div>
      
      <UButton :label="t('hist.export')" icon="i-lucide-download" variant="outline" color="neutral" class="cursor-pointer w-full sm:w-auto" @click="isExportModalOpen = true" />
    </div>

    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" :ui="{ body: 'p-0' }">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead class="bg-slate-50 dark:bg-slate-800/50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">{{ t('hist.col.id') }}</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">{{ t('hist.col.item') }}</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">{{ t('hist.col.user') }}</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">{{ t('hist.col.lending') }}</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">{{ t('hist.col.returned') }}</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">{{ t('hist.col.duration') }}</th>
            <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">{{ t('hist.col.price') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
          <tr v-if="pending" v-for="i in 5" :key="i">
             <td v-for="j in 7" :key="j" class="px-6 py-4"><div class="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-24"></div></td>
          </tr>
          <tr v-else v-for="tx in filteredTransactions" :key="tx.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td class="px-6 py-4 text-[10px] font-mono text-slate-400">#{{ tx.transactionId.split('-')[0] }}</td>
            <td class="px-6 py-4">
              <p class="font-bold text-slate-900 dark:text-white">{{ tx.vehicle?.name }}</p>
              <p class="text-xs text-slate-500">{{ tx.vehicle?.code }}</p>
            </td>
            <td class="px-6 py-4 text-sm font-medium">{{ tx.customer?.full_name }}</td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
               {{ formatDate(tx.lendingTime) }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
               <template v-if="tx.returnedTime">
  {{ formatDate(tx.returnedTime) }}
</template>
<div v-else class="flex flex-col gap-1">
  <UBadge :label="t('hist.badge_lending')" color="info" variant="subtle" class="font-bold animate-pulse w-fit" />
  <div class="flex flex-col text-[10px] text-slate-500 font-medium leading-tight">
    <span>{{ t('hist.expected_return') }}</span>
    <span class="text-blue-600 dark:text-blue-400">{{ formatDate(tx.expectedReturnTime) }}</span>
  </div>
</div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-500 font-medium">
              {{ tx.duration || '-' }}
            </td>
            <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
              {{ tx.price ? formatPrice(tx.price) : '-' }}
            </td>
          </tr>
          <tr v-if="!pending && filteredTransactions.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-slate-500">
              {{ t('hist.empty') }}
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <div class="flex justify-end pt-4">
      <div class="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-lg border border-slate-800 flex items-center gap-6">
        <div class="flex flex-col">
          <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400">{{ t('hist.total_tx') }}</span>
          <span class="text-xl font-mono">{{ filteredTransactions.length }}</span>
        </div>
        <div class="w-px h-8 bg-slate-700"></div>
        <div class="flex flex-col">
          <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400">{{ t('hist.total_amount') }}</span>
          <span class="text-2xl font-bold font-mono text-primary-400">{{ formatPrice(displayedTotal) }}</span>
        </div>
      </div>
    </div>
    <!-- Export Modal -->
    <UModal v-model:open="isExportModalOpen" :title="t('hist.export.title')" :description="t('hist.export.desc')">
      <template #body>
        <div class="space-y-4">
          <UFormField :label="t('hist.export.start')">
            <UInput type="date" v-model="exportStartDate" class="w-full" />
          </UFormField>
          <UFormField :label="t('hist.export.end')">
            <UInput type="date" v-model="exportEndDate" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-3 mt-6">
            <UButton :label="t('cancel')" variant="ghost" color="neutral" @click="isExportModalOpen = false" class="cursor-pointer" />
            <UButton :label="t('hist.export.download')" icon="i-lucide-download" color="primary" @click="downloadExport" class="cursor-pointer" />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
