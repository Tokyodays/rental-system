<script setup lang="ts">
const stats = [
  { label: 'Lent', value: '142', icon: 'i-lucide-log-out', color: 'blue' },
  { label: 'Available', value: '89', icon: 'i-lucide-check-circle', color: 'green' },
  { label: "Today's Transactions", value: '12', icon: 'i-lucide-repeat', color: 'orange' }
]

const recentTransactions = [
  { item: 'Honda PCX 125', user: 'Taro Tanaka', action: 'Lend', time: '10 mins ago', status: 'Processing', statusColor: 'orange' },
  { item: 'Yamaha PAS', user: 'Hanako Sato', action: 'Return', time: '1 hour ago', status: 'Completed', statusColor: 'green' },
  { item: 'CB400 SF', user: 'Ichiro Suzuki', action: 'Lend', time: '3 hours ago', status: 'Completed', statusColor: 'green' },
  { item: 'Road Bike SL7', user: 'Jiro Takahashi', action: 'Return', time: 'Yesterday', status: 'Completed', statusColor: 'green' },
  { item: 'Honda Super Cub', user: 'Saburo Ito', action: 'Lend', time: 'Yesterday', status: 'Completed', statusColor: 'green' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">Overview</h1>
        <p class="text-slate-500 mt-1">Check today's rental and return status.</p>
      </div>
      <UButton
        label="Scan QR"
        icon="i-lucide-qr-code"
        size="lg"
        class="sm:hidden"
      />
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
          <p class="text-3xl font-bold">{{ stat.value }}</p>
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
          <UButton label="View All" variant="link" color="primary" to="/history" />
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
            <tr v-for="tx in recentTransactions" :key="tx.item" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td class="px-6 py-4 font-medium">{{ tx.item }}</td>
              <td class="px-6 py-4 flex items-center gap-2">
                <UAvatar size="xs" :alt="tx.user" />
                {{ tx.user }}
              </td>
              <td class="px-6 py-4">
                <span :class="tx.action === 'Lend' ? 'text-blue-600 font-medium' : 'text-green-600 font-medium'">
                  {{ tx.action }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-500">{{ tx.time }}</td>
              <td class="px-6 py-4">
                <UBadge
                  :label="tx.status"
                  :color="tx.statusColor === 'orange' ? 'warning' : 'success'"
                  variant="subtle"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
