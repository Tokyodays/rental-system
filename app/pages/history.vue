<script setup lang="ts">
const transactions = [
  { id: 'TXN-8829-001', item: 'MacBook Pro 16"', user: 'Taro Tanaka', type: 'Lend', date: 'Oct 25, 2023', status: 'Completed' },
  { id: 'TXN-8829-002', item: 'iPad Pro', user: 'Hanako Sato', type: 'Return', date: 'Oct 25, 2023', status: 'Completed' },
  { id: 'TXN-8829-003', item: 'Dell XPS 15', user: 'Ichiro Suzuki', type: 'Lend', date: 'Oct 24, 2023', status: 'Completed' },
  { id: 'TXN-8829-004', item: 'Canon EOS R5', user: 'Jiro Takahashi', type: 'Return', date: 'Oct 24, 2023', status: 'Completed' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-2xl font-bold">Transaction History</h1>
      <UButton label="Export CSV" icon="i-lucide-download" variant="outline" color="neutral" class="cursor-pointer" />
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
          <tr v-for="t in transactions" :key="t.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td class="px-6 py-4 text-xs font-mono text-slate-500">{{ t.id }}</td>
            <td class="px-6 py-4 font-bold">{{ t.item }}</td>
            <td class="px-6 py-4">{{ t.user }}</td>
            <td class="px-6 py-4">
               <span :class="t.type === 'Lend' ? 'text-blue-600' : 'text-green-600'" class="font-bold border px-2 py-0.5 rounded text-xs border-current">
                 {{ t.type }}
               </span>
            </td>
            <td class="px-6 py-4 text-slate-500">{{ t.date }}</td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </div>
</template>
