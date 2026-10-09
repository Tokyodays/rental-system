<script setup lang="ts">
import type { Database } from '../types/database.types'
import { ROLE_IDS } from '#shared/constants/auth'
import type { Locale } from '~/locales'

definePageMeta({
  middleware: ['settings-only-admin']
})

const supabase = useSupabaseClient<Database>()
const toast = useToast()
const { staff, fetchStaff } = useStaff()

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
const { locale, t, setLocale, availableLocales } = useI18n()

/**
 * 言語を即時に切り替え、この店舗のデフォルト言語（stores.default_locale）としても保存する。
 * 保存したデフォルトは、言語を明示的に選んでいない端末（Cookie なし）で使われる。
 */
async function handleLocaleChange(value: Locale) {
  setLocale(value)
  if (!store.value) return
  try {
    const { error } = await supabase
      .from('stores')
      .update({ default_locale: value } as any)
      .eq('id', store.value.id)
    if (error) throw error
    store.value.default_locale = value
    // staff キャッシュの stores.default_locale も更新する（fetchStaff は取得済みなら何もしないため直接書き換える）
    if (staff.value?.stores) staff.value.stores.default_locale = value
    toast.add({ title: t('set.lang_saved'), description: t('set.lang_saved_desc'), color: 'success', icon: 'i-lucide-check' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : t('set.unknown_error')
    toast.add({ title: t('error'), description: msg, color: 'error', icon: 'i-lucide-x-circle' })
  }
}

// ---- データ取得 ----
// Store 情報を取得してフォームに反映
async function fetchStore(storeId: string) {
  const { data: storeData } = await supabase
    .from('stores')
    .select('id, name, address, currency_id, default_locale')
    .eq('id', storeId)
    .single() as any

  if (storeData) {
    store.value = storeData as Store
    storeName.value = storeData.name ?? ''
    storeAddress.value = storeData.address ?? ''
    storeCurrency.value = storeData.currency_id ?? null
  }
}

// Staff 一覧を取得
async function fetchStaffList(storeId: string) {
  const { data: staffData } = await supabase
    .from('staff')
    .select('id, username, role_id, staff_roles(name)')
    .eq('store_id', storeId)
    .order('username') as any

  if (staffData) {
    staffList.value = staffData as StaffMember[]
  }
}

// Store 情報 → Staff 一覧の順に取得（Store 取得で例外が出たら Staff 取得はしない）
async function fetchStoreAndStaff() {
  if (!staff.value?.store_id) return

  isLoadingStaff.value = true
  try {
    await fetchStore(staff.value.store_id)
    await fetchStaffList(staff.value.store_id)
  } catch (err) {
    console.error('[Settings] fetch error:', err)
  } finally {
    isLoadingStaff.value = false
  }
}

// $fetch のエラーからメッセージを取り出す（サーバーのメッセージを優先）
interface FetchErrorLike {
  data?: { message?: string }
  message?: string
}

function toFetchErrorMessage(err: FetchErrorLike) {
  return err.data?.message || err.message
}

// ---- ストア情報の保存 ----
async function handleSaveStore() {
  if (!store.value) return
  isSavingStore.value = true
  try {
    const { error } = await supabase
      .from('stores')
      .update({
        name: storeName.value, 
        address: storeAddress.value,
        currency_id: storeCurrency.value
      } as any)
      .eq('id', store.value.id)

    if (error) throw error
    if (store.value) {
      store.value.name = storeName.value
      store.value.address = storeAddress.value
      store.value.currency_id = storeCurrency.value
    }
    
    // キャッシュを更新
    await fetchStaff()
    toast.add({ title: t('set.saved'), description: t('set.saved_desc'), color: 'success', icon: 'i-lucide-check' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : t('set.unknown_error')
    toast.add({ title: t('error'), description: msg, color: 'error', icon: 'i-lucide-x-circle' })
  } finally {
    isSavingStore.value = false
  }
}

// ---- スタッフの追加・削除 ----
const isAddingStaff = ref(false)
const isDeletingStaff = ref<Record<string, boolean>>({})
const isAddModalOpen = ref(false)
const newStaff = reactive({
  username: '',
  password: '',
  role_id: ROLE_IDS.STAFF as string // user role as default
})

function openAddModal() {
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
}

// 追加フォームをリセット（role_id は前回の選択を保持）
function resetNewStaffForm() {
  newStaff.username = ''
  newStaff.password = ''
}

async function handleAddStaff() {
  if (!newStaff.username || !newStaff.password) return

  // バリデーション: 英数字のみ
  if (!/^[a-zA-Z0-9]+$/.test(newStaff.username)) {
    toast.add({ title: t('auth.invalid_username'), description: t('auth.username_alnum'), color: 'error' })
    return
  }

  isAddingStaff.value = true
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        ...newStaff,
        store_id: staff.value?.store_id
      }
    })
    
    toast.add({ title: t('set.toast.staff_added'), description: t('set.toast.staff_added_desc'), color: 'success' })
    closeAddModal()
    resetNewStaffForm()
    
    await fetchStoreAndStaff()
  } catch (err: any) {
    toast.add({ title: t('set.toast.add_failed'), description: toFetchErrorMessage(err), color: 'error' })
  } finally {
    isAddingStaff.value = false
  }
}

async function handleDeleteStaff(member: StaffMember) {
  if (!confirm(t('set.confirm_delete', { name: member.username ?? '' }))) return

  isDeletingStaff.value[member.id] = true
  try {
    await $fetch('/api/admin/users', {
      method: 'DELETE',
      body: { id: member.id }
    })
    
    toast.add({ title: t('set.toast.staff_deleted'), description: t('set.toast.staff_deleted_desc'), color: 'success' })
    await fetchStoreAndStaff()
  } catch (err: any) {
    toast.add({ title: t('set.toast.delete_failed'), description: toFetchErrorMessage(err), color: 'error' })
  } finally {
    isDeletingStaff.value[member.id] = false
  }
}

const isUpdatingRole = ref<Record<string, boolean>>({})

async function handleStaffRoleChange(member: StaffMember, isAdmin: boolean) {
  const newRoleId = isAdmin ? ROLE_IDS.ADMIN : ROLE_IDS.STAFF
  if (member.role_id === newRoleId) return

  // 管理者1名維持の制約チェック
  if (!isAdmin) {
    const adminCount = staffList.value.filter(s => s.staff_roles?.name === 'admin').length
    if (adminCount <= 1) {
      toast.add({
        title: t('set.toast.denied'),
        description: t('set.toast.denied_desc'),
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
      .from('staff')
      .update({ role_id: newRoleId } as any)
      .eq('id', member.id)

    if (error) throw error
    toast.add({ title: t('set.toast.role_updated'), description: t(isAdmin ? 'set.toast.role_admin' : 'set.toast.role_user', { name: member.username || t('set.staff_fallback') }), color: 'success' })
    await fetchStoreAndStaff()
  } catch (err: any) {
    toast.add({ title: t('update_failed'), description: err.message, color: 'error' })
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
      <p class="text-slate-500 mt-1">{{ t('set.subtitle') }}</p>
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
        <p class="text-sm text-slate-500">{{ t('set.lang_desc') }}</p>
        <URadioGroup
          :model-value="locale"
          :items="availableLocales"
          data-testid="language-select"
          @update:model-value="(v) => handleLocaleChange(v as Locale)"
          orientation="horizontal"
          :ui="{ wrapper: 'flex flex-wrap gap-x-8 gap-y-4' }"
        >
          <template #label="{ item }">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-400 w-6">{{ item.short }}</span>
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
          <h2 class="font-semibold text-base">{{ t('set.store_info') }}</h2>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField :label="t('set.store_name')" name="storeName">
          <UInput
            v-model="storeName"
            :placeholder="t('set.store_name')"
            icon="i-lucide-building-2"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField :label="t('set.store_address')" name="storeAddress">
          <UInput
            v-model="storeAddress"
            :placeholder="t('set.store_address')"
            icon="i-lucide-map-pin"
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UFormField :label="t('set.currency')" name="storeCurrency">
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
            {{ t('set.currency_help', { symbol: currencies.find(c => c.id === storeCurrency)?.currency_symbol ?? '' }) }}
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
            @click="handleSaveStore"
          />
        </div>
      </template>
    </UCard>

    <!-- ③ Staff 一覧 -->
    <UCard class="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" :ui="{ body: 'p-0' }">
      <template #header>
        <div class="flex items-center gap-2 px-2 w-full">
          <UIcon name="i-lucide-users" class="size-5 text-blue-600" />
          <h2 class="font-semibold text-base">{{ t('set.staff') }}</h2>
          <UBadge :label="staffList.length.toString()" color="neutral" variant="subtle" class="ml-2" />
          
          <UButton
            :label="t('set.staff_add')"
            icon="i-lucide-user-plus"
            size="sm"
            color="primary"
            class="ml-auto font-bold"
            @click="openAddModal"
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
                <p>{{ t('set.staff_loading') }}</p>
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
                      <span v-if="member.id === staff?.id" class="ml-2 text-xs text-blue-500 font-normal">{{ t('set.you') }}</span>
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <USwitch
                    :model-value="member.staff_roles?.name === 'admin'"
                    :loading="isUpdatingRole[member.id]"
                    @update:model-value="(val: boolean) => handleStaffRoleChange(member, val)"
                  />
                  <span
                    class="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    :class="member.staff_roles?.name === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
                  >
                    {{ member.staff_roles?.name === 'admin' ? t('set.role.admin') : t('set.role.user') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <UButton
                  v-if="member.id !== staff?.id"
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  :loading="isDeletingStaff[member.id]"
                  @click="handleDeleteStaff(member)"
                />
              </td>
            </tr>

            <!-- 空状態 -->
            <tr v-if="!isLoadingStaff && staffList.length === 0">
              <td colspan="3" class="px-6 py-10 text-center text-slate-500">
                {{ t('set.staff_empty') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- スタッフ追加モーダル -->
    <UModal v-model:open="isAddModalOpen">
      <template #content>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">{{ t('set.add_modal.title') }}</h3>
            <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="closeAddModal" />
          </div>

          <div class="space-y-4">
            <UFormField :label="t('set.add_modal.username')" name="username" required>
              <UInput v-model="newStaff.username" placeholder="staff123" icon="i-lucide-at-sign" />
              <template #help>{{ t('set.add_modal.username_help') }}</template>
            </UFormField>

            <UFormField :label="t('password')" name="password" required>
              <UInput v-model="newStaff.password" type="password" placeholder="••••••••" icon="i-lucide-lock" />
              <template #help>{{ t('set.add_modal.password_help') }}</template>
            </UFormField>

            <UFormField :label="t('role')" name="role">
              <div class="flex gap-4">
                <URadioGroup
                  v-model="newStaff.role_id"
                  :items="[
                    { label: t('set.role.user_cap'), value: ROLE_IDS.STAFF },
                    { label: t('set.role.admin_cap'), value: ROLE_IDS.ADMIN }
                  ]"
                  orientation="horizontal"
                />
              </div>
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <UButton :label="t('cancel')" variant="ghost" color="neutral" @click="closeAddModal" />
            <UButton
              :label="t('set.add_modal.create')"
              color="primary"
              icon="i-lucide-user-plus"
              :loading="isAddingStaff"
              @click="handleAddStaff"
            />
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
