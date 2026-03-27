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
}

interface StaffMember {
  id: string
  full_name: string | null
  role_id: string
  staff_roles: { name: string } | null
}

// ---- ストア情報 ----
const store = ref<Store | null>(null)
const storeName = ref('')
const storeAddress = ref('')
const isSavingStore = ref(false)

// ---- スタッフ一覧 ----
const staffList = ref<StaffMember[]>([])
const isLoadingStaff = ref(true)

// ---- 言語 ----
const locale = useCookie<'ja' | 'en'>('locale', { default: () => 'ja' })
const isJapanese = computed({
  get: () => locale.value === 'ja',
  set: (v: boolean) => { locale.value = v ? 'ja' : 'en' }
})

// ---- データ取得 ----
async function fetchStoreAndStaff() {
  if (!staff.value?.store_id) return

  isLoadingStaff.value = true
  try {
    // Store 情報
    const { data: storeData } = await supabase
      .from('stores' as any)
      .select('id, name, address')
      .eq('id', staff.value.store_id)
      .single() as any

    if (storeData) {
      store.value = storeData as Store
      storeName.value = storeData.name ?? ''
      storeAddress.value = storeData.address ?? ''
    }

    // Staff 一覧
    const { data: staffData } = await supabase
      .from('staff' as any)
      .select('id, full_name, role_id, staff_roles(name)')
      .eq('store_id', staff.value.store_id)
      .order('full_name') as any

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
      .update({ name: storeName.value, address: storeAddress.value } as any)
      .eq('id', store.value.id)

    if (error) throw error
    store.value.name = storeName.value
    store.value.address = storeAddress.value
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
    toast.add({ title: 'Role Updated', description: `${member.full_name || 'Staff'} is now an ${isAdmin ? 'Admin' : 'User'}.`, color: 'success' })
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
      <h1 class="text-2xl font-bold">Settings</h1>
      <p class="text-slate-500 mt-1">Manage your store and account preferences.</p>
    </div>

    <!-- ① 言語切替 -->
    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-languages" class="size-5 text-blue-600" />
          <h2 class="font-semibold text-base">Language</h2>
        </div>
      </template>
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">Display Language</p>
          <p class="text-sm text-slate-500">Switch between Japanese and English.</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium" :class="!isJapanese ? 'text-slate-400' : 'text-slate-900 dark:text-white'">日本語</span>
          <USwitch v-model="isJapanese" color="primary" />
          <span class="text-sm font-medium" :class="isJapanese ? 'text-slate-400' : 'text-slate-900 dark:text-white'">English</span>
        </div>
      </div>
    </UCard>

    <!-- ② Store 情報 -->
    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-store" class="size-5 text-blue-600" />
          <h2 class="font-semibold text-base">Store Information</h2>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="Store Name" name="storeName">
          <UInput
            v-model="storeName"
            placeholder="Enter store name"
            icon="i-lucide-building-2"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField label="Store Address" name="storeAddress">
          <UInput
            v-model="storeAddress"
            placeholder="Enter store address"
            icon="i-lucide-map-pin"
            class="w-full"
            size="lg"
          />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            label="Save Changes"
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
        <div class="flex items-center gap-2 px-2">
          <UIcon name="i-lucide-users" class="size-5 text-blue-600" />
          <h2 class="font-semibold text-base">Staff Members</h2>
          <UBadge :label="staffList.length.toString()" color="neutral" variant="subtle" class="ml-auto" />
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-sm uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Name</th>
              <th class="px-6 py-3 font-medium border-b border-slate-200 dark:border-slate-800">Role</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            <!-- ローディング -->
            <tr v-if="isLoadingStaff">
              <td colspan="2" class="px-6 py-10 text-center text-slate-500">
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
                    :alt="member.full_name ?? 'Staff'"
                    class="font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                  />
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">
                      {{ member.full_name ?? '—' }}
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
            </tr>

            <!-- 空状態 -->
            <tr v-if="!isLoadingStaff && staffList.length === 0">
              <td colspan="2" class="px-6 py-10 text-center text-slate-500">
                No staff members found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
