<script setup lang="ts">
const supabase = useSupabaseClient()
const { ensureLoaded, vehicleStatusId } = useStatusIds()
const { t, tName, dateLocale } = useI18n()

const statValues = ref(['0', '0', '0'])
const stats = computed(() => [
  { label: t('dash.stat.lending'), value: statValues.value[0], icon: 'i-lucide-log-out', color: 'blue' },
  { label: t('dash.stat.available'), value: statValues.value[1], icon: 'i-lucide-check-circle', color: 'green' },
  { label: t('dash.stat.today'), value: statValues.value[2], icon: 'i-lucide-repeat', color: 'orange' }
])

interface Transaction {
  id: string
  item: string
  user: string
  action: string
  timeObj: Date
  status: string
  statusColor: string
}

const recentTransactions = ref<Transaction[]>([])
const isLoading = ref(true)

async function fetchDashboardData() {
  try {
    isLoading.value = true
    
    // Fetch vehicle statuses for count
    await ensureLoaded()
    const { data: vehicles } = await supabase.from('vehicles').select('status_id')

    let lentCount = 0
    let availableCount = 0

    if (vehicles) {
      const lentStatusId = vehicleStatusId('Lent')
      const availStatusId = vehicleStatusId('Available')

      lentCount = vehicles.filter((v: any) => v.status_id === lentStatusId).length
      availableCount = vehicles.filter((v: any) => v.status_id === availStatusId).length
    }
    
    statValues.value[0] = lentCount.toString()
    statValues.value[1] = availableCount.toString()
    
    // Fetch Transactions to compute today's tx & recent tx
    const { data: transactionsData } = await (supabase
      .from('transactions')
      .select('*, vehicles(name, code), customers(full_name)')
      .order('start_at', { ascending: false }) as any)
      
    const transactions = transactionsData || []
    
    let transactionCountToday = 0
    const events: any[] = []
    
    const today = new Date()
    today.setHours(0,0,0,0) // Start of today
    
    transactions.forEach((r: any) => {
      // Check start_at for 'Lend' event
      if (r.start_at) {
        const startAt = new Date(r.start_at)
        if (startAt >= today) transactionCountToday++
        
        events.push({
          id: `${r.id}-L`,
          item: r.vehicles?.name || '',
          user: r.customers?.full_name || '',
          action: 'Lend',
          timeObj: startAt,
          status: r.status === 'Completed' ? 'Completed' : 'Processing',
          statusColor: r.status === 'Completed' ? 'green' : 'orange'
        })
      }
      
      // Check end_at for 'Return' event
      if (r.status === 'Completed' && r.end_at) {
        const endAt = new Date(r.end_at)
        if (endAt >= today) transactionCountToday++
        
        events.push({
          id: `${r.id}-R`,
          item: r.vehicles?.name || '',
          user: r.customers?.full_name || '',
          action: 'Return',
          timeObj: endAt,
          status: 'Completed',
          statusColor: 'green'
        })
      }
    })
    
    statValues.value[2] = transactionCountToday.toString()
    
    // Sort events by date descending and take top 5
    events.sort((a, b) => b.timeObj.getTime() - a.timeObj.getTime())
    const topEvents = events.slice(0, 5)
    
    recentTransactions.value = topEvents
    
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

// 時刻は表示言語に合わせて描画時に整形する（言語切替で再取得しない）
const formatTime = (d: Date) => d.toLocaleString(dateLocale.value, {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
})

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">{{ t('dash.overview') }}</h1>
        <p class="text-slate-500 mt-1">{{ t('dash.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton
          :label="t('lending')"
          icon="i-lucide-log-out"
          color="primary"
          size="lg"
          to="/rentals/new"
          class="cursor-pointer font-bold px-8 shadow-lg shadow-blue-500/20"
        />
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <template #default>
          <div class="flex justify-between items-start mb-4">
            <p class="text-slate-500 font-medium">{{ stat.label }}</p>
            <div
              :class="[
                'p-2 rounded-lg',
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 
                stat.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
              ]"
            >
              <UIcon :name="stat.icon" class="size-5" />
            </div>
          </div>
          <p v-if="isLoading" class="h-9 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded"></p>
          <p v-else class="text-3xl font-bold">{{ stat.value }}</p>
        </template>
      </UCard>
    </div>

    <!-- Recent Transactions Table -->
    <UCard
      class="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      :ui="{ body: 'p-0' }"
    >
      <template #header>
        <div class="flex justify-between items-center px-4 py-2">
          <h3 class="text-lg font-bold">{{ t('dash.recent') }}</h3>
          <UButton :label="t('dash.view_all')" variant="link" color="primary" to="/history" class="cursor-pointer" />
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">{{ t('dash.col.item') }}</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">{{ t('dash.col.user') }}</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">{{ t('dash.col.action') }}</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">{{ t('dash.col.time') }}</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">{{ t('status') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                <UIcon name="i-lucide-loader-2" class="animate-spin size-8 mb-2 mx-auto" />
                <p>{{ t('dash.loading_tx') }}</p>
              </td>
            </tr>
            <tr v-else v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4 font-medium">{{ tx.item || t('unknown') }}</td>
              <td class="px-6 py-4 flex items-center gap-2">
                <UAvatar size="xs" :alt="tx.user || t('unknown')" class="font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
                <span class="font-bold text-slate-900 dark:text-white">{{ tx.user || t('unknown') }}</span>
              </td>
              <td class="px-6 py-4">
                <UBadge 
                  :label="tx.action === 'Lend' ? t('dash.action.lend') : t('dash.action.return')" 
                  :color="tx.action === 'Lend' ? 'info' : 'success'" 
                  variant="subtle"
                  class="font-bold cursor-pointer"
                />
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium">{{ formatTime(tx.timeObj) }}</td>
              <td class="px-6 py-4">
                <UBadge
                  :label="tName('status', tx.status)"
                  :color="tx.statusColor === 'orange' ? 'warning' : 'success'"
                  variant="subtle"
                />
              </td>
            </tr>
            <tr v-if="!isLoading && recentTransactions.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                {{ t('dash.empty') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
