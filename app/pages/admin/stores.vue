<script setup lang="ts">
const supabase = useSupabaseClient()
const { t } = useI18n()
const toast = useToast()

const stores = ref<any[]>([])
const isLoading = ref(false)
const isAddingStore = ref(false)
const isAddingAdmin = ref(false)
const selectedStore = ref<any>(null)

const newStore = reactive({
  name: '',
  address: '',
  currency_id: 1
})

const newAdmin = reactive({
  username: '',
  password: ''
})

async function fetchStores() {
  isLoading.value = true
  const { data } = await supabase
    .from('stores')
    .select('id, name, address, currency(currency_text)')
  if (data) stores.value = data
  isLoading.value = false
}

async function handleAddStore() {
  try {
    const { store } = await $fetch('/api/admin/stores', {
      method: 'POST',
      body: newStore
    }) as any
    
    toast.add({ title: 'Store Created', description: `Store "${store.name}" has been added.`, color: 'success' })
    isAddingStore.value = false
    newStore.name = ''
    newStore.address = ''
    await fetchStores()
  } catch (err: any) {
    console.log('DEBUG API ERROR:', err.data?.message || err.message)
    toast.add({ title: 'Error', description: err.message, color: 'error' })
  }
}

async function handleAddAdmin() {
  if (!selectedStore.value) return
  
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        ...newAdmin,
        role_id: '00000000-0000-0000-0001-000000000001', // Admin role
        store_id: selectedStore.value.id
      }
    })
    
    toast.add({ title: 'Admin Created', description: `Admin "@${newAdmin.username}" created for ${selectedStore.value.name}.`, color: 'success' })
    isAddingAdmin.value = false
    newAdmin.username = ''
    newAdmin.password = ''
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.message, color: 'error' })
  }
}

function openAdminModal(store: any) {
  selectedStore.value = store
  isAddingAdmin.value = true
}

onMounted(() => {
  fetchStores()
})
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('store_management') }}</h1>
        <p class="text-slate-500 text-sm">Manage all business locations</p>
      </div>
      <UButton
        id="btn-add-store"
        icon="i-lucide-plus"
        label="Add Store"
        @click="isAddingStore = true"
        class="cursor-pointer"
      />
    </div>

    <UCard class="overflow-hidden" :ui="{ body: { padding: 'p-0' } }">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm uppercase tracking-wider">
          <tr>
            <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Name</th>
            <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Address</th>
            <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Currency</th>
            <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="store in stores" :key="store.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{ store.name }}</td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ store.address || '—' }}</td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{ store.currency?.currency_text || 'USD' }}</td>
            <td class="px-6 py-4 text-right">
              <UButton
                icon="i-lucide-user-plus"
                label="Add Admin"
                size="xs"
                variant="ghost"
                @click="openAdminModal(store)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <!-- Add Store Modal -->
    <UModal v-model="isAddingStore" title="Add New Store">
      <div class="p-4">
        <form @submit.prevent="handleAddStore" class="space-y-4">
          <UFormField label="Store Name" required>
            <UInput v-model="newStore.name" placeholder="Branch Name" />
          </UFormField>
          <UFormField label="Address">
            <UInput v-model="newStore.address" placeholder="123 Street, City" />
          </UFormField>
          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="isAddingStore = false" />
            <UButton id="btn-create-store" type="submit" label="Create Store" color="primary" />
          </div>
        </form>
      </div>
    </UModal>

    <!-- Add Admin Modal -->
    <UModal v-model="isAddingAdmin" :title="'Add Admin for ' + selectedStore?.name">
      <div class="p-4">
        <form @submit.prevent="handleAddAdmin" class="space-y-4">
          <UFormField label="Admin Username" required>
            <UInput v-model="newAdmin.username" placeholder="branch_admin" />
          </UFormField>
          <UFormField label="Password" required>
            <UInput v-model="newAdmin.password" type="password" placeholder="••••••••" />
          </UFormField>
          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="isAddingAdmin = false" />
            <UButton id="btn-create-admin" type="submit" label="Create Admin" color="primary" />
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>
