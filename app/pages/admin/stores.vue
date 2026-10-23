<script setup lang="ts">
import { ROLE_IDS } from '#shared/constants/auth'

definePageMeta({
  layout: 'admin',
  middleware: 'super-admin-only'
})

const supabase = useSupabaseClient()
const { t } = useI18n()
const toast = useToast()

const stores = ref<any[]>([])
const isLoading = ref(false)
const isAddingStore = ref(false)
const isAddingAdmin = ref(false)
const isDeletingStore = ref(false)
const selectedStore = ref<any>(null)

// ---- 店舗スタッフの二段階認証（スマホの紛失・機種変更のときにリセットする） ----
interface StoreStaffMfa { id: string, username: string | null, role: string | null, mfaEnabled: boolean }
const isMfaModalOpen = ref(false)
const storeStaff = ref<StoreStaffMfa[]>([])
const isLoadingStoreStaff = ref(false)
const resettingMfaId = ref<string | null>(null)

async function loadStoreStaff() {
  if (!selectedStore.value) return
  isLoadingStoreStaff.value = true
  try {
    storeStaff.value = await $fetch<StoreStaffMfa[]>('/api/admin/store-staff', { query: { storeId: selectedStore.value.id } })
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.data?.message || err.message, color: 'error' })
  } finally {
    isLoadingStoreStaff.value = false
  }
}

function openMfaModal(store: any) {
  selectedStore.value = store
  storeStaff.value = []
  isMfaModalOpen.value = true
  loadStoreStaff()
}

async function handleResetMfa(member: StoreStaffMfa) {
  if (!confirm(`Reset two-step verification for @${member.username}? They will set it up again at their next sign-in.`)) return
  resettingMfaId.value = member.id
  try {
    await $fetch('/api/admin/mfa-reset', { method: 'POST', body: { id: member.id } })
    toast.add({ title: '2FA Reset', description: `@${member.username} will set up two-step verification at next sign-in.`, color: 'success' })
    await loadStoreStaff()
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.data?.message || err.message, color: 'error' })
  } finally {
    resettingMfaId.value = null
  }
}

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
        role_id: ROLE_IDS.ADMIN,
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

function openDeleteModal(store: any) {
  selectedStore.value = store
  isDeletingStore.value = true
}

async function handleDeleteStore() {
  if (!selectedStore.value) return
  try {
    await $fetch('/api/admin/stores', {
      method: 'DELETE',
      body: { id: selectedStore.value.id }
    })
    toast.add({ title: 'Store Deleted', description: `Store "${selectedStore.value.name}" has been deleted.`, color: 'success' })
    isDeletingStore.value = false
    selectedStore.value = null
    await fetchStores()
  } catch (err: any) {
    toast.add({ title: 'Error', description: err.data?.message || err.message, color: 'error' })
  }
}

onMounted(() => {
  fetchStores()
})
</script>

<template>
  <div class="md:p-6 max-w-6xl mx-auto space-y-6">
    <div class="flex flex-wrap justify-between items-center gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ t('store_management') }}</h1>
        <p class="text-slate-500 text-sm">Manage all business locations</p>
      </div>
      <UButton
        id="btn-add-store"
        icon="i-lucide-plus"
        label="Add Store"
        @click="() => { isAddingStore = true }"
        class="cursor-pointer"
      />
    </div>

    <UCard class="overflow-hidden" :ui="{ body: 'p-0' }">
      <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse whitespace-nowrap">
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
            <td class="px-6 py-4 text-right space-x-2">
              <UButton
                icon="i-lucide-user-plus"
                label="Add Admin"
                size="xs"
                variant="ghost"
                @click="openAdminModal(store)"
              />
              <UButton
                icon="i-lucide-shield-check"
                label="Staff / 2FA"
                size="xs"
                variant="ghost"
                color="neutral"
                @click="openMfaModal(store)"
              />
              <UButton
                icon="i-lucide-trash-2"
                label="Delete"
                size="xs"
                variant="ghost"
                color="error"
                @click="openDeleteModal(store)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </UCard>

    <!-- Add Store Modal -->
    <UModal v-model:open="isMfaModalOpen" :title="'Staff of ' + (selectedStore?.name ?? '')" description="Reset two-step verification when a staff member loses or changes their phone.">
      <template #body>
        <div v-if="isLoadingStoreStaff" class="flex justify-center py-8">
          <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-slate-400" />
        </div>
        <p v-else-if="storeStaff.length === 0" class="py-6 text-center text-sm text-slate-500">No staff yet.</p>
        <ul v-else class="divide-y divide-slate-100 dark:divide-slate-800" data-testid="store-staff-list">
          <li v-for="member in storeStaff" :key="member.id" class="flex items-center justify-between gap-3 py-3">
            <div class="min-w-0">
              <p class="font-medium truncate">@{{ member.username }}</p>
              <p class="text-xs text-slate-500">{{ member.role }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <UBadge :label="member.mfaEnabled ? '2FA on' : '2FA not set up'" :color="member.mfaEnabled ? 'success' : 'neutral'" variant="subtle" />
              <UButton
                v-if="member.mfaEnabled"
                label="Reset 2FA"
                icon="i-lucide-rotate-ccw"
                size="xs"
                variant="ghost"
                color="neutral"
                :loading="resettingMfaId === member.id"
                @click="handleResetMfa(member)"
              />
            </div>
          </li>
        </ul>
      </template>
    </UModal>

    <UModal v-model:open="isAddingStore" title="Add New Store">
      <template #body>
        <form @submit.prevent="handleAddStore" class="space-y-4">
          <UFormField label="Store Name" required>
            <UInput v-model="newStore.name" placeholder="Branch Name" />
          </UFormField>
          <UFormField label="Address">
            <UInput v-model="newStore.address" placeholder="123 Street, City" />
          </UFormField>
          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="() => { isAddingStore = false }" />
            <UButton id="btn-create-store" type="submit" label="Create Store" color="primary" />
          </div>
        </form>
      </template>
    </UModal>

    <!-- Delete Store Confirmation Modal -->
    <UModal v-model:open="isDeletingStore" title="Delete Store">
      <template #body>
        <p class="text-slate-600 dark:text-slate-400">
          Are you sure you want to delete <span class="font-semibold text-slate-900 dark:text-white">{{ selectedStore?.name }}</span>?
          This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3 mt-6">
          <UButton label="Cancel" color="neutral" variant="ghost" @click="() => { isDeletingStore = false }" />
          <UButton label="Delete" color="error" icon="i-lucide-trash-2" @click="handleDeleteStore" />
        </div>
      </template>
    </UModal>

    <!-- Add Admin Modal -->
    <UModal v-model:open="isAddingAdmin" :title="'Add Admin for ' + selectedStore?.name">
      <template #body>
        <form @submit.prevent="handleAddAdmin" class="space-y-4">
          <UFormField label="Admin Username" required>
            <UInput v-model="newAdmin.username" placeholder="branch_admin" />
          </UFormField>
          <UFormField label="Password" required>
            <UInput v-model="newAdmin.password" type="password" placeholder="••••••••" />
          </UFormField>
          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="() => { isAddingAdmin = false }" />
            <UButton id="btn-create-admin" type="submit" label="Create Admin" color="primary" />
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
