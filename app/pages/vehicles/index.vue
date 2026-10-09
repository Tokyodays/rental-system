<script setup lang="ts">
import {
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
  ...vehicleStatuses.value.map(s => ({ label: tName('status', s.name), value: s.name }))
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
  categoryName: 'Bike',
  status: 'Available',
  lastMileage: 0,
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
      image_urls: newVehicle.imageUrls
    } as any)
  
  if (error) throw error
}

/** vehicles を code で更新し、失敗時は throw する */
type VehicleUpdateValues = Partial<{ status_id: string; last_mileage: number; image_urls: string[] }>

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
  isEditingPhotos.value = false
})
</script>

<template>
  <div class="flex flex-1 overflow-hidden -m-6 h-[calc(100vh-64px)]">
    <main class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden min-w-[600px]">
      <!-- Sub Header / Filters -->
      <div class="flex flex-col gap-4 p-6 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-4 mt-2">
          <div class="flex-1 relative">
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
              <div class="flex items-center gap-1">
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
              <div class="flex items-center gap-1">
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
            @click="isAddModalOpen = true"
          />
        </div>
      </div>

      <!-- Table Area -->
      <div class="flex-1 overflow-auto p-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-sm">
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
      class="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto hidden lg:flex"
    >
      <div class="p-6 flex flex-col h-full">
        <div class="flex items-start justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('veh.details') }}</h3>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="selectedVehicle = null"
          />
        </div>

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
                @click="isEditingPhotos = true"
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
              @click="isEditingPhotos = false"
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
              v-if="selectedVehicle.status !== 'Lent'"
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
              @click="navigateTo(`/rentals/return?code=${selectedVehicle.code}`)"
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
          </div>
        </div>
      </div>
    </aside>

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

          <UFormField :label="t('veh.modal.photos')" name="imageUrls">
            <VehiclePhotoManager v-model="newVehicle.imageUrls" />
          </UFormField>

          <div class="flex justify-end gap-3 mt-6">
            <UButton :label="t('cancel')" variant="ghost" color="neutral" class="cursor-pointer" @click="isAddModalOpen = false" />
            <UButton :label="t('veh.modal.save')" type="submit" color="primary" class="cursor-pointer" :loading="isSubmitting" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
