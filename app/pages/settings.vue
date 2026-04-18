<script setup lang="ts">
import type { Database } from '../types/database.types'

definePageMeta({
  middleware: ['settings-only-admin']
})

const supabase = useSupabaseClient<Database>()
const toast = useToast()
const { staff } = useStaff()

// ---- 型定義 ----
interface Store {
  id: string
  name: string
  address: string | null
  currency_id: number | null
  default_locale: string | null
}

interface StaffMember {
  id: string
  username: string | null
  role_id: string
  staff_roles: { name: string } | null
}

const { currencies, currentSymbol, updateCurrency } = useCurrency()
const storeCurrency = ref<number | null>(null)
const store = ref<Store | null>(null)
const storeName = ref('')
const storeAddress = ref('')
const isSavingStore = ref(false)

// ---- スタッフ一覧 ----
const staffList = ref<StaffMember[]>([])
const isLoadingStaff = ref(true)

// ---- 言語設定 ----
const { locale, t, availableLocales } = useI18n()

// ---- データ取得 ----
async function fetchStoreAndStaff() {
  if (!staff.value?.store_id) return

  isLoadingStaff.value = true
  try {
    // Store 情報
    const { data: storeData } = await supabase
      .from('stores' as any)
      .select('id, name, address, currency_id')
      .eq('id', staff.value.store_id)
      .single() as any

    if (storeData) {
      store.value = storeData as Store
      storeName.value = storeData.name ?? ''
      storeAddress.value = storeData.address ?? ''
      storeCurrency.value = storeData.currency_id ?? null
      if (storeData.default_locale) {
        locale.value = storeData.default_locale as any
      }
    }

    // Staff 一覧
    const { data: staffData } = await supabase
      .from('staff' as any)
      .select('id, username, role_id, staff_roles(name)')
      .eq('store_id', staff.value.store_id)
      .order('username') as any

    if (staffData) {
      staffList.value = staffData as StaffMember[]
    }
  } catch (err) {
    console.error('[Settings] fetch error:', err)
  } finally {
    isLoadingStaff.value = false
  }
}

// ---- ストア情報の保存 ----
async function saveStore() {
  if (!store.value) return
  isSavingStore.value = true
  try {
    const { error } = await supabase
      .from('stores' as any)
      .update({ 
        name: storeName.value, 
        address: storeAddress.value,
        currency_id: storeCurrency.value,
        default_locale: locale.value
      } as any)
      .eq('id', store.value.id)

    if (error) throw error
    if (store.value) {
      store.value.name = storeName.value
      store.value.address = storeAddress.value
      store.value.currency_id = storeCurrency.value
    }
    
    // キャッシュを更新
    const { fetchStaff } = useStaff()
    await fetchStaff()
    toast.add({ title: 'Saved', description: 'Store information updated.', color: 'success', icon: 'i-lucide-check' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    toast.add({ title: 'Error', description: msg, color: 'error', icon: 'i-lucide-x-circle' })
  } finally {
    isSavingStore.value = false
  }
}

// ---- スタッフのロール更新 ----
const ADMIN_ROLE_ID = '00000000-0000-0000-0001-000000000001'
const USER_ROLE_ID = '00000000-0000-0000-0001-000000000002'
// ---- スタッフの追加・削除 ----
const isAddingStaff = ref(false)
const isDeletingStaff = ref<Record<string, boolean>>({})
const showAddModal = ref(false)
const newStaff = reactive({
  username: '',
  password: '',
  role_id: '00000000-0000-0000-0001-000000000002' // user role as default
})

async function addStaff() {
  if (!newStaff.username || !newStaff.password) return

  // バリデーション: 英数字のみ
  if (!/^[a-zA-Z0-9]+$/.test(newStaff.username)) {
    toast.add({ title: 'Invalid Username', description: 'Username must be alphanumeric.', color: 'error' })
    return
  }

  isAddingStaff.value = true
  try {
    const response = await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        ...newStaff,
        store_id: staff.value?.store_id
      }
    })
    
    toast.add({ title: 'Staff Added', description: 'New staff member has been created.', color: 'success' })
    showAddModal.value = false
    // Reset form
    newStaff.username = ''
    newStaff.password = ''
    
    await fetchStoreAndStaff()
  } catch (err: any) {
    toast.add({ title: 'Failed to add staff', description: err.data?.message || err.message, color: 'error' })
  } finally {
    isAddingStaff.value = false
  }
}

async function deleteStaff(member: StaffMember) {
  if (!confirm(`Are you sure you want to delete ${member.username}? This action cannot be undone.`)) return

  isDeletingStaff.value[member.id] = true
  try {
    await $fetch('/api/admin/users', {
      method: 'DELETE',
      body: { id: member.id }
    })
    
    toast.add({ title: 'Staff Deleted', description: 'User account has been removed.', color: 'success' })
    await fetchStoreAndStaff()
  } catch (err: any) {
    toast.add({ title: 'Delete Failed', description: err.data?.message || err.message, color: 'error' })
  } finally {
    isDeletingStaff.value[member.id] = false
  }
}

const isUpdatingRole = ref<Record<string, boolean>>({})

async function updateStaffRole(member: StaffMember, isAdmin: boolean) {
  const newRoleId = isAdmin ? ADMIN_ROLE_ID : USER_ROLE_ID
  if (member.role_id === newRoleId) return

  // 管理者1名維持の制約チェック
  if (!isAdmin) {
    const adminCount = staffList.value.filter(s => s.staff_roles?.name === 'admin').length
    if (adminCount <= 1) {
      toast.add({
        title: 'Action Denied',
        description: 'At least one admin is required for each store.',
        color: 'error',
        icon: 'i-lucide-alert-triangle'
      })
      // 元の状態に戻すために一覧を再取得
      await fetchStoreAndStaff()
      return
    }
  }

  isUpdatingRole.value[member.id] = true
  try {
    const { error } = await supabase
      .from('staff' as any)
      .update({ role_id: newRoleId } as any)
      .eq('id', member.id)

    if (error) throw error
    toast.add({ title: 'Role Updated', description: `${member.username || 'Staff'} is now an ${isAdmin ? 'Admin' : 'User'}.`, color: 'success' })
    await fetchStoreAndStaff()
  } catch (err: any) {
    toast.add({ title: 'Update Failed', description: err.message, color: 'error' })
    await fetchStoreAndStaff()
  } finally {
    isUpdatingRole.value[member.id] = false
  }
}

onMounted(() => {
  fetchStoreAndStaff()
})

// staffが遅延ロードされる場合はwatchで対応
watch(() => staff.value?.store_id, (newId) => {
  if (newId) fetchStoreAndStaff()
})
</script>

<template>
  <div class="space-y-8 max-w-3xl">
    <!-- ページヘッダー -->
    <div>
      <h1 class="text-2xl font-bold">{{ t('settings') }}</h1>
      <p class="text-slate-500 mt-1">Manage your store and account preferences.</p>
    </div>

    <!-- ① 言語切替 -->
    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-languages" class="size-5 text-blue-600" />
          <h2 class="font-semibold text-base">{{ t('language') }}</h2>
        </div>
      </template>
      <div class="space-y-4">
        <p class="text-sm text-slate-500">Select your preferred display language.</p>
        <URadioGroup
          v-model="locale"
          :items="availableLocales"
          orientation="horizontal"
          :ui="{ wrapper: 'flex flex-wrap gap-x-8 gap-y-4' }"
        >
          <template #label="{ item }">
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ item.icon }}</span>
              <span class="font-medium">{{ item.label }}</span>
            </div>
          </template>
        </URadioGroup>
      </div>
    </UCard>

    <!-- ② Store 情報 -->
    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-store" class="size-5 text-blue-600" />
          <h2 class="font-semibold text-base">{{ t('store_info') }}</h2>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField :label="t('store_name')" name="storeName">
          <UInput
            v-model="storeName"
            :placeholder="t('store_name')"
            icon="i-lucide-building-2"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField :label="t('store_address')" name="storeAddress">
          <UInput
            v-model="storeAddress"
            :placeholder="t('store_address')"
            icon="i-lucide-map-pin"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField :label="t('currency')" name="storeCurrency">
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="c in currencies"
              :key="c.id"
              :label="c.currency_text"
              :color="storeCurrency === c.id ? 'primary' : 'neutral'"
              :variant="storeCurrency === c.id ? 'solid' : 'outline'"
              class="min-w-16 justify-center font-bold"
              @click="storeCurrency = c.id"
            />
          </div>
          <template #help>
            Prices will be displayed with '{{ currencies.find(c => c.id === storeCurrency)?.currency_symbol }}' symbol.
          </template>
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            :label="t('save')"
            icon="i-lucide-save"
            color="primary"
            :loading="isSavingStore"
            class="cursor-pointer font-bold"
            @click="saveStore"
          />
        </div>
      </template>
    </UCard>

    <!-- ③ Staff 一覧 -->
    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" :ui="{ body: 'p-0' }">
      <template #header>
        <div class="flex items-center gap-2 px-2 w-full">
          <UIcon name="i-lucide-users" class="size-5 text-blue-600" />
          <h2 class="font-semibold text-base">{{ t('staff_members') }}</h2>
          <UBadge :label="staffList.length.toString()" color="neutral" variant="subtle" class="ml-2" />
          
          <UButton
            :label="t('add') + ' Staff'"
            icon="i-lucide-user-plus"
            size="sm"
            color="primary"
            class="ml-auto font-bold"
            @click="showAddModal = true"
          />
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">{{ t('username') }}</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">{{ t('role') }}</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800 text-right">{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <!-- ローディング -->
            <tr v-if="isLoadingStaff">
              <td colspan="3" class="px-6 py-10 text-center text-slate-500">
                <UIcon name="i-lucide-loader-2" class="animate-spin size-6 mx-auto mb-2" />
                <p>Loading staff...</p>
              </td>
            </tr>

            <!-- データ行 -->
            <tr
              v-for="member in staffList"
              v-else
              :key="member.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              :class="member.id === staff?.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    size="sm"
                    :alt="member.username ?? 'Staff'"
                    class="font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                  />
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">
                      @{{ member.username }}
                      <span v-if="member.id === staff?.id" class="ml-2 text-xs text-blue-500 font-normal">(You)</span>
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <USwitch
                    :model-value="member.staff_roles?.name === 'admin'"
                    :loading="isUpdatingRole[member.id]"
                    @update:model-value="(val: boolean) => updateStaffRole(member, val)"
                  />
                  <span
                    class="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    :class="member.staff_roles?.name === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
                  >
                    {{ member.staff_roles?.name ?? 'user' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <UButton
                  v-if="member.id !== staff?.id"
                  icon="i-lucide-trash-2"
                  color="red"
                  variant="ghost"
                  size="xs"
                  :loading="isDeletingStaff[member.id]"
                  @click="deleteStaff(member)"
                />
              </td>
            </tr>

            <!-- 空状態 -->
            <tr v-if="!isLoadingStaff && staffList.length === 0">
              <td colspan="3" class="px-6 py-10 text-center text-slate-500">
                No staff members found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- スタッフ追加モーダル -->
    <UModal v-model:open="showAddModal">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">Add New Staff</h3>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="showAddModal = false" />
          </div>

          <div class="space-y-4">
            <UFormField :label="t('username') + ' (英数字)'" name="username" required>
              <UInput v-model="newStaff.username" placeholder="staff123" icon="i-lucide-at-sign" />
              <template #help>Login ID. Alphanumeric only.</template>
            </UFormField>

            <UFormField :label="t('password')" name="password" required>
              <UInput v-model="newStaff.password" type="password" placeholder="••••••••" icon="i-lucide-lock" />
              <template #help>At least 6 characters.</template>
            </UFormField>

            <UFormField :label="t('role')" name="role">
              <div class="flex gap-4">
                <URadioGroup
                  v-model="newStaff.role_id"
                  :items="[
                    { label: 'User', value: USER_ROLE_ID },
                    { label: 'Admin', value: ADMIN_ROLE_ID }
                  ]"
                  orientation="horizontal"
                />
              </div>
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" variant="ghost" color="neutral" @click="showAddModal = false" />
            <UButton
              label="Create Account"
              color="primary"
              icon="i-lucide-user-plus"
              :loading="isAddingStaff"
              @click="addStaff"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
