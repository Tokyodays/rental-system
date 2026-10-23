<script setup lang="ts">
import {
  DELETED_VEHICLE_FILTER,
  VEHICLE_CATEGORY_FILTERS,
  VEHICLE_CATEGORY_NAMES,
  matchesVehicleFilter,
  toStatusAccessLabel,
  toToggledVehicleStatus,
  toVehicle,
  toVehicleQrUrl,
  type Vehicle,
  type VehicleRow
} from '~/utils/vehicle'

const search = ref('')
const selectedCategory = ref('All')
const selectedStatus = ref('All')

const { t, tName, dateLocale } = useI18n()
const { ensureLoaded, vehicleStatuses, vehicleStatusId } = useStatusIds()
const statusOptions = computed(() => [
  { label: t('all'), value: 'All' },
  ...vehicleStatuses.value.map(s => ({ label: tName('status', s.name), value: s.name })),
  { label: t('veh.deleted'), value: DELETED_VEHICLE_FILTER }
])
const categoryOptions = computed(() =>
  VEHICLE_CATEGORY_NAMES.map(name => ({ label: tName('category', name), value: name }))
)

const client = useSupabaseClient()
const toast = useToast()
const { staff } = useStaff()
const vehicles = ref<Vehicle[]>([])
const isLoadingVehicles = ref(true)

// Add Vehicle Modal State
const isAddModalOpen = ref(false)
const isSubmitting = ref(false)
const newVehicle = reactive({
  name: '',
  categoryName: 'Bike' as VehicleCategoryName,
  status: 'Available',
  lastMileage: 0,
  lastOilChangeOn: '',
  imageUrls: [] as string[]
})

async function fetchVehicles() {
  isLoadingVehicles.value = true
  try {
    // 1. Fetch Statuses
    await ensureLoaded()

    // 2. Fetch Vehicles with Relations
    const { data, error } = await client
      .from('vehicles')
      .select('*, image_urls, vehicle_categories(name, icon), vehicle_statuses(name, color)')
      // 並び順を指定しないと、更新した車両が一覧の末尾へ移動してしまうため登録順に固定する
      .order('created_at', { ascending: true })
      .order('code', { ascending: true })

    if (error) {
      console.error('Supabase Error:', error)
      throw error
    }
    
    vehicles.value = (data as unknown as VehicleRow[] | null)?.map(toVehicle) || []
  } catch (e) {
    console.error('Error fetching vehicles:', e)
  } finally {
    isLoadingVehicles.value = false
  }
}

async function fetchCategoryId(categoryName: string): Promise<string> {
  const { data: catData } = await client
    .from('vehicle_categories')
    .select('id')
    .eq('name', categoryName)
    .single()
  
  if (!catData) throw new Error('Category not found')
  return (catData as any).id
}

async function fetchDefaultStatusId(): Promise<string> {
  await ensureLoaded()
  const statusId = vehicleStatusId('Available')
  if (!statusId) throw new Error('Default status not found')
  return statusId
}

async function createVehicle(categoryId: string, storeId: string, statusId: string) {
  const { error } = await client
    .from('vehicles')
    .insert({
      name: newVehicle.name,
      category_id: categoryId,
      store_id: storeId,
      status_id: statusId,
      last_mileage: newVehicle.lastMileage,
      last_oil_change_on: newVehicle.lastOilChangeOn || null,
      image_urls: newVehicle.imageUrls
    } as any)
  
  if (error) throw error
}

/** vehicles を code で更新し、失敗時は throw する */
type VehicleUpdateValues = Partial<{ status_id: string; last_mileage: number; last_oil_change_on: string | null; image_urls: string[]; deleted_at: string | null }>

async function updateVehicleByCode(code: string, values: VehicleUpdateValues) {
  const { error } = await client
    .from('vehicles')
    .update(values as any)
    .eq('code', code)

  if (error) throw error
}

// カテゴリ・ステータス（Bike / Available）は保持したまま、入力値のみ初期化する
function resetNewVehicleForm() {
  newVehicle.name = ''
  newVehicle.lastMileage = 0
  newVehicle.lastOilChangeOn = ''
  newVehicle.imageUrls = []
}

async function handleAddVehicle() {
  isSubmitting.value = true
  try {
    // 1. Get Category ID
    const categoryId = await fetchCategoryId(newVehicle.categoryName)

    // 2. Get Store ID associated with the logged-in staff
    if (!staff.value?.store_id) throw new Error('Store not found for this user')
    const storeId = staff.value.store_id

    // 3. Get Status ID (Default to Available)
    const statusId = await fetchDefaultStatusId()

    // 4. Insert Vehicle
    await createVehicle(categoryId, storeId, statusId)

    // Success
    isAddModalOpen.value = false
    resetNewVehicleForm()
    
    await fetchVehicles()
  } catch (e) {
    console.error('Add failed:', e)
    toast.add({ title: t('veh.toast.add_failed'), description: (e as any)?.message || t('veh.toast.add_failed_desc'), color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchVehicles()
})

const selectedVehicle = ref<Vehicle | null>(null)

const filteredVehicles = computed<Vehicle[]>(() => {
  const filter = { search: search.value, category: selectedCategory.value, status: selectedStatus.value }
  return (vehicles.value || []).filter((v: Vehicle) => matchesVehicleFilter(v, filter))
})

/** 一覧を再取得し、サイドバーの selectedVehicle を最新データに差し替える */
async function refreshVehiclesKeepingSelection() {
  await fetchVehicles()

  const updated = vehicles.value.find(v => v.code === selectedVehicle.value?.code)
  if (updated) selectedVehicle.value = updated
}

function handleSelectVehicle(v: Vehicle) {
  selectedVehicle.value = v
}

async function handleToggleVehicleStatus() {
  if (!selectedVehicle.value) return
  if (selectedVehicle.value.status === 'Lent') {
    toast.add({ title: t('veh.toast.not_allowed'), description: t('veh.toast.not_allowed_desc'), color: 'error' })
    return
  }

  const targetStatusName = toToggledVehicleStatus(selectedVehicle.value.status)
  
  const targetStatusId = vehicleStatusId(targetStatusName)
  if (!targetStatusId) return

  try {
    await updateVehicleByCode(selectedVehicle.value.code, { status_id: targetStatusId })

    toast.add({ title: t('veh.toast.status_updated'), description: t('veh.toast.status_updated_desc', { status: tName('status', targetStatusName) }), color: 'success' })
    
    // Refresh data
    await fetchVehicles()
    
    // Close sidebar（差し替えではなく閉じる）
    selectedVehicle.value = null
  } catch (e: any) {
    console.error('Update failed:', e)
    toast.add({ title: t('update_failed'), description: e.message, color: 'error' })
  }
}

function openQR(code: string) {
  window.open(toVehicleQrUrl(code, 500), '_blank')
}

const isEditingMileage = ref(false)
const editMileageValue = ref(0)
const isUpdatingMileage = ref(false)

function handleStartEditMileage() {
  if (!selectedVehicle.value) return
  editMileageValue.value = selectedVehicle.value.lastMileage
  isEditingMileage.value = true
}

async function handleSaveMileage() {
  if (!selectedVehicle.value) return
  isUpdatingMileage.value = true
  try {
    await updateVehicleByCode(selectedVehicle.value.code, { last_mileage: editMileageValue.value })
    
    selectedVehicle.value.lastMileage = editMileageValue.value
    toast.add({ title: t('veh.toast.mileage_updated'), description: t('veh.toast.mileage_updated_desc'), color: 'success' })
    await refreshVehiclesKeepingSelection()
  } catch (e: any) {
    console.error('Update mileage failed:', e)
    toast.add({ title: t('update_failed'), description: e.message, color: 'error' })
  } finally {
    isUpdatingMileage.value = false
    isEditingMileage.value = false
  }
}

function handleCancelEditMileage() {
  isEditingMileage.value = false
}

// 最後にオイル交換した日付（未来日は選べない。編集開始時は「今日」を初期値にする）
const isEditingOilChange = ref(false)
const editOilChangeValue = ref('')
const isUpdatingOilChange = ref(false)
const todayDateOnly = computed(() => toDateOnlyString(new Date()))

function handleStartEditOilChange() {
  if (!selectedVehicle.value) return
  editOilChangeValue.value = todayDateOnly.value
  isEditingOilChange.value = true
}

async function handleSaveOilChange() {
  if (!selectedVehicle.value) return
  const value = editOilChangeValue.value || null
  isUpdatingOilChange.value = true
  try {
    await updateVehicleByCode(selectedVehicle.value.code, { last_oil_change_on: value })

    selectedVehicle.value.lastOilChangeOn = value
    toast.add({ title: t('veh.toast.oil_change_updated'), color: 'success' })
    await refreshVehiclesKeepingSelection()
  } catch (e: any) {
    console.error('Update oil change date failed:', e)
    toast.add({ title: t('update_failed'), description: e.message, color: 'error' })
  } finally {
    isUpdatingOilChange.value = false
    isEditingOilChange.value = false
  }
}

// ---- 車両の削除（論理削除）・復元 ----
// 取引履歴が車両を参照しているため行は消さず deleted_at を記録する。
// 削除時は Unavailable にして、古い画面や QR から貸し出されないようにする
const isDeleteModalOpen = ref(false)
const isDeletingVehicle = ref(false)

async function handleDeleteVehicle() {
  if (!selectedVehicle.value) return
  const unavailableId = vehicleStatusId('Unavailable')
  const lentId = vehicleStatusId('Lent')
  if (!unavailableId || !lentId) return

  isDeletingVehicle.value = true
  try {
    // 貸出中なら削除しない（画面の表示が古くても、DB 上で貸出中なら 0 件更新になる）
    const { data, error } = await client
      .from('vehicles')
      .update({ deleted_at: new Date().toISOString(), status_id: unavailableId })
      .eq('code', selectedVehicle.value.code)
      .neq('status_id', lentId)
      .is('deleted_at', null)
      .select('code')

    if (error) throw error
    isDeleteModalOpen.value = false
    if (!data?.length) {
      toast.add({ title: t('veh.toast.not_allowed'), description: t('veh.delete_lent_hint'), color: 'error' })
      await refreshVehiclesKeepingSelection()
      return
    }

    toast.add({ title: t('veh.toast.deleted'), color: 'success' })
    selectedVehicle.value = null
    await fetchVehicles()
  } catch (e: any) {
    console.error('Delete vehicle failed:', e)
    toast.add({ title: t('update_failed'), description: e.message, color: 'error' })
  } finally {
    isDeletingVehicle.value = false
  }
}

async function handleRestoreVehicle() {
  if (!selectedVehicle.value) return
  try {
    await updateVehicleByCode(selectedVehicle.value.code, { deleted_at: null })
    toast.add({ title: t('veh.toast.restored'), description: t('veh.restore_hint'), color: 'success' })
    // 復元した車両は「Deleted」では表示されなくなるため、一覧の絞り込みを All に戻す
    selectedStatus.value = 'All'
    await refreshVehiclesKeepingSelection()
  } catch (e: any) {
    console.error('Restore vehicle failed:', e)
    toast.add({ title: t('update_failed'), description: e.message, color: 'error' })
  }
}

// Photo editing in sidebar
const isEditingPhotos = ref(false)
const isUpdatingPhotos = ref(false)

async function handleSavePhotos(newUrls: string[]) {
  if (!selectedVehicle.value) return
  isUpdatingPhotos.value = true
  try {
    await updateVehicleByCode(selectedVehicle.value.code, { image_urls: newUrls })
    
    selectedVehicle.value.imageUrls = newUrls
    toast.add({ title: t('veh.toast.photos_updated'), description: t('veh.toast.photos_updated_desc'), color: 'success' })
    await refreshVehiclesKeepingSelection()
  } catch (e: any) {
    console.error('Update photos failed:', e)
    toast.add({ title: t('update_failed'), description: e.message, color: 'error' })
  } finally {
    isUpdatingPhotos.value = false
  }
}

// Reset editing state when a different vehicle is selected
watch(selectedVehicle, () => {
  isEditingMileage.value = false
  isEditingOilChange.value = false
  isEditingPhotos.value = false
})
</script>

<template>
  <!-- 印刷時は画面の高さ・スクロールの制限を外し、一覧を最後まで出す -->
  <div class="flex flex-1 overflow-hidden -m-6 h-[calc(100vh-64px)] print:m-0 print:h-auto print:overflow-visible">
    <main class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden min-w-0 print:overflow-visible">
      <!-- Sub Header / Filters -->
      <div class="flex flex-col gap-4 p-4 md:p-6 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div class="flex flex-wrap items-center gap-3 md:gap-4 mt-2">
          <div class="relative w-full sm:w-auto sm:flex-1 sm:min-w-48">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              :placeholder="t('veh.search')"
              size="md"
              class="w-full"
            />
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <span class="text-[10px] font-bold text-slate-400 px-2 uppercase">{{ t('veh.category') }}</span>
              <div class="flex flex-wrap items-center gap-1">
                <button
                  v-for="cat in VEHICLE_CATEGORY_FILTERS"
                  :key="cat"
                  @click="selectedCategory = cat"
                  :class="[
                    'px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
                    selectedCategory === cat 
                       ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  ]"
                >
                  {{ cat === 'All' ? t('all') : tName('category', cat) }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <span class="text-[10px] font-bold text-slate-400 px-2 uppercase">{{ t('status') }}</span>
              <div class="flex flex-wrap items-center gap-1">
                <button
                  v-for="s in statusOptions"
                  :key="s.value"
                  @click="selectedStatus = s.value"
                  :class="[
                    'px-3 py-1 rounded-md text-xs font-medium transition-all',
                    selectedStatus === s.value 
                       ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  ]"
                >
                  {{ s.label }}
                </button>
              </div>
            </div>
          </div>
          <UButton
            :label="t('veh.add')"
            icon="i-lucide-plus"
            color="primary"
            size="md"
            class="cursor-pointer"
            @click="() => { isAddModalOpen = true }"
          />
        </div>
      </div>

      <!-- Table Area -->
      <div class="flex-1 overflow-auto p-4 md:p-6 print:overflow-visible">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto text-sm">
          <div v-if="isLoadingVehicles" class="p-8 text-center text-slate-500">
            <UIcon name="i-lucide-loader-2" class="animate-spin size-8 mb-2" />
            <p>{{ t('veh.loading') }}</p>
          </div>
          <table v-else class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('veh.col.name') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('veh.col.id') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('status') }}</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('veh.col.updated') }}</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ t('actions') }}</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              <tr
                v-for="v in filteredVehicles"
                :key="v.code"
                @click="handleSelectVehicle(v)"
                :class="[
                  'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
                  selectedVehicle?.code === v.code ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <UIcon :name="v.icon" class="size-6" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-slate-900 dark:text-white">{{ v.name }}</div>
                      <div class="text-sm text-slate-500 dark:text-slate-400">{{ tName('category', v.category) }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-400">{{ v.code }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge
                    :label="tName('status', v.status)"
                    :color="v.statusColor as any"
                    variant="subtle"
                    class="rounded-full"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{{ v.lastUpdated ? new Date(v.lastUpdated).toLocaleDateString(dateLocale) : '' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <UButton
                    icon="i-lucide-ellipsis-vertical"
                    variant="ghost"
                    color="neutral"
                    class="cursor-pointer"
                  />
                </td>
              </tr>
              <tr v-if="filteredVehicles.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                  {{ t('veh.empty') }}
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Pagination Mock -->
          <div class="bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 sm:px-6 font-medium">
            <p class="text-sm text-slate-700 dark:text-slate-300">
              {{ t('showing_results', { n: filteredVehicles.length }) }}
            </p>
            <div class="flex gap-2">
              <UButton icon="i-lucide-chevron-left" variant="outline" color="neutral" size="xs" disabled class="cursor-pointer" />
              <UButton icon="i-lucide-chevron-right" variant="outline" color="neutral" size="xs" disabled class="cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Details Sidebar -->
    <aside
      v-if="selectedVehicle"
      class="fixed inset-0 z-40 w-full lg:static lg:z-auto lg:w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto"
    >
      <div class="p-6 flex flex-col h-full">
        <div class="flex items-start justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('veh.details') }}</h3>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="() => { selectedVehicle = null }"
          />
        </div>

        <UAlert
          v-if="selectedVehicle.deletedAt"
          data-testid="vehicle-deleted-banner"
          icon="i-lucide-archive"
          color="neutral"
          variant="subtle"
          class="mb-6"
          :title="t('veh.deleted_on', { date: new Date(selectedVehicle.deletedAt).toLocaleDateString(dateLocale) })"
          :description="t('veh.restore_hint')"
        />

        <div class="mb-6">
          <div v-if="!isEditingPhotos" class="space-y-4">
            <VehiclePhotoCarousel :images="selectedVehicle.imageUrls" />
            <div class="flex justify-center">
              <UButton
                :label="t('veh.edit_photos')"
                icon="i-lucide-camera"
                size="xs"
                variant="ghost"
                color="neutral"
                class="cursor-pointer"
                @click="() => { isEditingPhotos = true }"
              />
            </div>
          </div>
          <div v-else class="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <VehiclePhotoManager
              :model-value="selectedVehicle.imageUrls"
              :vehicle-id="selectedVehicle.code"
              @update:model-value="handleSavePhotos"
            />
            <UButton
              :label="t('veh.done')"
              size="sm"
              block
              color="neutral"
              variant="soft"
              class="mt-4 cursor-pointer"
              @click="() => { isEditingPhotos = false }"
            />
          </div>
          
          <div class="mt-6 flex flex-col items-center">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white text-center">{{ selectedVehicle.name }}</h2>
            <p class="text-slate-500 dark:text-slate-400 font-mono text-sm mt-1">{{ selectedVehicle.code }}</p>
            <div class="mt-4">
              <UBadge
                :label="tName('status', selectedVehicle.status)"
                :color="selectedVehicle.statusColor as any"
                variant="subtle"
                class="rounded-full px-4"
              />
            </div>
          </div>
        </div>

        <!-- QR Code Display -->
        <div class="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center border border-slate-200 dark:border-slate-800">
           <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{{ t('veh.unique_qr') }}</p>
           <div class="bg-white p-3 rounded-xl shadow-inner border border-slate-100 mb-3">
             <img :src="toVehicleQrUrl(selectedVehicle.code, 150)" class="size-32" :alt="t('veh.qr_alt')" />
           </div>
           <p class="text-xs font-mono font-bold text-slate-500">{{ selectedVehicle.code }}</p>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800 py-4 flex flex-col gap-4">
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">{{ t('veh.category') }}</p>
            <span class="text-sm text-slate-900 dark:text-white font-medium">{{ tName('category', selectedVehicle.category) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">{{ t('veh.status_access') }}</p>
              <span class="text-sm text-slate-900 dark:text-white font-medium">
                {{ toStatusAccessLabel(selectedVehicle.status, t) }}
              </span>
            </div>
            <UButton
              v-if="selectedVehicle.status !== 'Lent' && !selectedVehicle.deletedAt"
              :label="selectedVehicle.status === 'Available' ? t('veh.set_unavailable') : t('veh.set_available')"
              :variant="selectedVehicle.status === 'Available' ? 'subtle' : 'solid'"
              :color="selectedVehicle.status === 'Available' ? 'error' : 'success'"
              size="xs"
              class="cursor-pointer"
              @click="handleToggleVehicleStatus"
            />
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{{ t('veh.mileage') }}</p>
              <UButton
                v-if="!isEditingMileage"
                icon="i-lucide-pencil"
                size="xs"
                variant="ghost"
                color="neutral"
                class="cursor-pointer"
                @click="handleStartEditMileage"
              />
            </div>
            <div v-if="isEditingMileage" class="flex items-center gap-2 mt-1">
              <UInput
                v-model.number="editMileageValue"
                type="number"
                size="sm"
                class="w-full"
              />
              <UButton
                icon="i-lucide-check"
                color="success"
                size="xs"
                variant="subtle"
                class="cursor-pointer shrink-0"
                :loading="isUpdatingMileage"
                @click="handleSaveMileage"
              />
              <UButton
                icon="i-lucide-x"
                color="neutral"
                size="xs"
                variant="ghost"
                class="cursor-pointer shrink-0"
                :disabled="isUpdatingMileage"
                @click="handleCancelEditMileage"
              />
            </div>
            <span v-else class="text-sm text-slate-900 dark:text-white font-medium">{{ selectedVehicle.lastMileage.toLocaleString() }} km</span>
          </div>
          <div data-testid="oil-change">
            <div class="flex items-center justify-between mb-1">
              <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">{{ t('veh.oil_change') }}</p>
              <UButton
                v-if="!isEditingOilChange"
                icon="i-lucide-pencil"
                size="xs"
                variant="ghost"
                color="neutral"
                class="cursor-pointer"
                :aria-label="t('veh.oil_change')"
                @click="handleStartEditOilChange"
              />
            </div>
            <div v-if="isEditingOilChange" class="flex items-center gap-2 mt-1">
              <UInput
                v-model="editOilChangeValue"
                type="date"
                :max="todayDateOnly"
                size="sm"
                class="w-full"
              />
              <UButton
                icon="i-lucide-check"
                color="success"
                size="xs"
                variant="subtle"
                class="cursor-pointer shrink-0"
                :aria-label="t('save')"
                :loading="isUpdatingOilChange"
                @click="handleSaveOilChange"
              />
              <UButton
                icon="i-lucide-x"
                color="neutral"
                size="xs"
                variant="ghost"
                class="cursor-pointer shrink-0"
                :aria-label="t('cancel')"
                :disabled="isUpdatingOilChange"
                @click="() => { isEditingOilChange = false }"
              />
            </div>
            <span v-else-if="selectedVehicle.lastOilChangeOn" data-testid="oil-change-value" class="text-sm text-slate-900 dark:text-white font-medium">
              {{ formatDateOnly(selectedVehicle.lastOilChangeOn, dateLocale) }}
              <span class="text-slate-500 font-normal ml-1">({{ t('veh.oil_change_days_ago', { n: daysSinceDateOnly(selectedVehicle.lastOilChangeOn) }) }})</span>
            </span>
            <span v-else data-testid="oil-change-value" class="text-sm text-slate-400">{{ t('veh.oil_change_none') }}</span>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800 py-4 mt-auto">
          <div class="flex flex-col gap-2">
            <UButton
              v-if="selectedVehicle.status === 'Lent'"
              :label="t('veh.process_return')"
              icon="i-lucide-corner-down-left"
              block
              color="primary"
              variant="solid"
              class="cursor-pointer"
              @click="() => { if (selectedVehicle) navigateTo(`/rentals/return?code=${selectedVehicle.code}`) }"
            />
            <UButton
              :label="t('veh.print_qr')"
              icon="i-lucide-qr-code"
              block
              color="neutral"
              variant="outline"
              class="cursor-pointer"
              @click="openQR(selectedVehicle.code)"
            />
            <UButton
              v-if="selectedVehicle.deletedAt"
              :label="t('veh.restore')"
              icon="i-lucide-archive-restore"
              block
              color="primary"
              variant="subtle"
              class="cursor-pointer"
              @click="handleRestoreVehicle"
            />
            <template v-else>
              <UButton
                :label="t('veh.delete')"
                icon="i-lucide-trash-2"
                block
                color="error"
                variant="ghost"
                class="cursor-pointer"
                :disabled="selectedVehicle.status === 'Lent'"
                @click="() => { isDeleteModalOpen = true }"
              />
              <p v-if="selectedVehicle.status === 'Lent'" class="text-xs text-slate-500 text-center">{{ t('veh.delete_lent_hint') }}</p>
            </template>
          </div>
        </div>
      </div>
    </aside>

    <!-- Delete Vehicle Modal -->
    <UModal
      v-model:open="isDeleteModalOpen"
      :title="t('veh.delete_confirm_title')"
      :description="t('veh.delete_confirm_desc', { name: selectedVehicle?.name ?? '' })"
    >
      <template #footer>
        <div class="flex justify-end gap-3 w-full">
          <UButton :label="t('cancel')" variant="ghost" color="neutral" class="cursor-pointer" @click="() => { isDeleteModalOpen = false }" />
          <UButton :label="t('delete')" color="error" class="cursor-pointer" :loading="isDeletingVehicle" @click="handleDeleteVehicle" />
        </div>
      </template>
    </UModal>

    <!-- Add Vehicle Modal -->
    <UModal v-model:open="isAddModalOpen" :title="t('veh.modal.title')" :description="t('veh.modal.desc')">
      <template #body>
        <UForm :state="newVehicle" class="space-y-4" @submit="handleAddVehicle">
          <UFormField :label="t('veh.modal.name')" name="name" required>
            <UInput v-model="newVehicle.name" :placeholder="t('veh.modal.name_ph')" />
          </UFormField>

          <UFormField :label="t('veh.category')" name="categoryName" required>
            <URadioGroup v-model="newVehicle.categoryName" :items="categoryOptions" orientation="horizontal" />
          </UFormField>

          <UFormField :label="t('veh.modal.mileage')" name="lastMileage">
            <UInput v-model.number="newVehicle.lastMileage" type="number" />
          </UFormField>

          <UFormField :label="t('veh.modal.oil_change')" name="lastOilChangeOn">
            <UInput v-model="newVehicle.lastOilChangeOn" type="date" :max="todayDateOnly" />
          </UFormField>

          <UFormField :label="t('veh.modal.photos')" name="imageUrls">
            <VehiclePhotoManager v-model="newVehicle.imageUrls" />
          </UFormField>

          <div class="flex justify-end gap-3 mt-6">
            <UButton :label="t('cancel')" variant="ghost" color="neutral" class="cursor-pointer" @click="() => { isAddModalOpen = false }" />
            <UButton :label="t('veh.modal.save')" type="submit" color="primary" class="cursor-pointer" :loading="isSubmitting" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
