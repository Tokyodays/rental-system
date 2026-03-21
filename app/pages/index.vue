<script setup lang="ts">
const supabase = useSupabaseClient()

const stats = ref([
  { label: 'Lending', value: '0', icon: 'i-lucide-log-out', color: 'blue' },
  { label: 'Available', value: '0', icon: 'i-lucide-check-circle', color: 'green' },
  { label: "Today's Transactions", value: '0', icon: 'i-lucide-repeat', color: 'orange' }
])

interface Transaction {
  id: string
  item: string
  user: string
  action: string
  time: string
  status: string
  statusColor: string
}

const recentTransactions = ref<Transaction[]>([])
const isLoading = ref(true)

async function fetchDashboardData() {
  try {
    isLoading.value = true
    
    // Fetch vehicle statuses for count
    const { data: vStatuses } = await supabase.from('vehicle_statuses').select('id, name')
    const { data: vehicles } = await supabase.from('vehicles').select('status_id')
    
    let lentCount = 0
    let availableCount = 0
    
    if (vStatuses && vehicles) {
      const lentStatusId = vStatuses.find((s: any) => s.name === 'Lent')?.id
      const availStatusId = vStatuses.find((s: any) => s.name === 'Available')?.id
      
      lentCount = vehicles.filter((v: any) => v.status_id === lentStatusId).length
      availableCount = vehicles.filter((v: any) => v.status_id === availStatusId).length
    }
    
    stats.value[0].value = lentCount.toString()
    stats.value[1].value = availableCount.toString()
    
    // Fetch Rentals to compute today's tx & recent tx
    const { data: rentalsData } = await (supabase
      .from('rentals')
      .select('*, vehicles(name, code), customers(full_name)')
      .order('start_at', { ascending: false }) as any)
      
    const rentals = rentalsData || []
    
    let transactionCountToday = 0
    const events: any[] = []
    
    const today = new Date()
    today.setHours(0,0,0,0) // Start of today
    
    rentals.forEach((r: any) => {
      // Check start_at for 'Lend' event
      if (r.start_at) {
        const startAt = new Date(r.start_at)
        if (startAt >= today) transactionCountToday++
        
        events.push({
          id: `${r.id}-L`,
          item: r.vehicles?.name || 'Unknown',
          user: r.customers?.full_name || 'Unknown',
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
          item: r.vehicles?.name || 'Unknown',
          user: r.customers?.full_name || 'Unknown',
          action: 'Return',
          timeObj: endAt,
          status: 'Completed',
          statusColor: 'green'
        })
      }
    })
    
    stats.value[2].value = transactionCountToday.toString()
    
    // Sort events by date descending and take top 5
    events.sort((a, b) => b.timeObj.getTime() - a.timeObj.getTime())
    const topEvents = events.slice(0, 5)
    
    // Format times
    recentTransactions.value = topEvents.map(e => {
      const timeStr = e.timeObj.toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
      return {
        id: e.id,
        item: e.item,
        user: e.user,
        action: e.action,
        time: timeStr,
        status: e.status,
        statusColor: e.statusColor
      }
    })
    
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Overview</h1>
        <p class="text-slate-500 mt-1">Check today's rental and return status.</p>
      </div>
      <div class="flex items-center gap-3">
        <UButton
          label="Lending"
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
          <h3 class="text-lg font-bold">Recent Transactions</h3>
          <UButton label="View All" variant="link" color="primary" to="/history" class="cursor-pointer" />
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Item</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">User</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Action</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Time</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                <UIcon name="i-lucide-loader-2" class="animate-spin size-8 mb-2 mx-auto" />
                <p>Loading transactions...</p>
              </td>
            </tr>
            <tr v-else v-for="tx in recentTransactions" :key="tx.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4 font-medium">{{ tx.item }}</td>
              <td class="px-6 py-4 flex items-center gap-2">
                <UAvatar size="xs" :alt="tx.user" class="font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
                <span class="font-bold text-slate-900 dark:text-white">{{ tx.user }}</span>
              </td>
              <td class="px-6 py-4">
                <UBadge 
                  :label="tx.action" 
                  :color="tx.action === 'Lend' ? 'info' : 'success'" 
                  variant="subtle"
                  class="font-bold cursor-pointer"
                />
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium">{{ tx.time }}</td>
              <td class="px-6 py-4">
                <UBadge
                  :label="tx.status"
                  :color="tx.statusColor === 'orange' ? 'warning' : 'success'"
                  variant="subtle"
                />
              </td>
            </tr>
            <tr v-if="!isLoading && recentTransactions.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                No recent transactions found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
