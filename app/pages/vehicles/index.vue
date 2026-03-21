<script setup lang="ts">
const search = ref('')
const selectedCategory = ref('All')
const selectedStatus = ref('All')
const categories = ['All', 'Bike', 'Car', 'Bicycle']
const categoryOptions = [
  { label: 'Bike', value: 'Bike' },
  { label: 'Car', value: 'Car' },
  { label: 'Bicycle', value: 'Bicycle' }
]

const vehicleStatuses = ref<{id: string, name: string, color: string}[]>([])
const statusOptions = computed(() => [
  { label: 'All', value: 'All' },
  ...vehicleStatuses.value.map(s => ({ label: s.name, value: s.name }))
])

interface Vehicle {
  id: string
  name: string
  category: string
  status: string
  statusColor: string
  lastUpdated: string
  icon: string
  lastMileage: number
  imageUrl: string | null
}

const client = useSupabaseClient()
const toast = useToast()
const vehicles = ref<Vehicle[]>([])
const isLoadingVehicles = ref(true)

// Add Vehicle Modal State
const isAddModalOpen = ref(false)
const isSubmitting = ref(false)
const newVehicle = reactive({
  code: '',
  name: '',
  categoryName: 'Bike',
  status: 'Available',
  lastMileage: 0
})

async function fetchVehicles() {
  isLoadingVehicles.value = true
  try {
    // 1. Fetch Statuses
    const { data: statusData } = await client.from('vehicle_statuses').select('*')
    vehicleStatuses.value = statusData || []

    // 2. Fetch Vehicles with Relations
    const { data, error } = await client
      .from('vehicles')
      .select('*, vehicle_categories(name, icon), vehicle_statuses(name, color)')
    
    if (error) {
      console.error('Supabase Error:', error)
      throw error
    }
    
    console.log('Fetched vehicles:', data)
    
    vehicles.value = data?.map((v: any) => ({
      id: v.code,
      name: v.name,
      category: v.vehicle_categories?.name || 'Unknown',
      status: v.vehicle_statuses?.name || 'Unknown',
      statusColor: v.vehicle_statuses?.color || 'neutral',
      lastUpdated: new Date(v.updated_at).toLocaleDateString(),
      icon: v.vehicle_categories?.icon || 'i-lucide-package',
      lastMileage: v.last_mileage || 0,
      imageUrl: v.image_url || null
    })) || []
  } catch (e) {
    console.error('Error fetching vehicles:', e)
  } finally {
    isLoadingVehicles.value = false
  }
}

async function handleAddVehicle() {
  isSubmitting.value = true
  try {
    // 1. Get Category ID
    const { data: catData } = await client
      .from('vehicle_categories')
      .select('id')
      .eq('name', newVehicle.categoryName)
      .single()
    
    if (!catData) throw new Error('Category not found')
    const categoryId = (catData as any).id

    // 2. Get Store ID (First store for now)
    const { data: storeData } = await client.from('stores').select('id').limit(1).single()
    if (!storeData) throw new Error('Store not found')
    const storeId = (storeData as any).id

    // 3. Get Status ID (Default to Available)
    const { data: statusData } = await client
      .from('vehicle_statuses')
      .select('id')
      .eq('name', 'Available')
      .single()
    if (!statusData) throw new Error('Default status not found')
    const statusId = (statusData as any).id

    // 4. Insert Vehicle
    const { error } = await client
      .from('vehicles')
      .insert({
        code: newVehicle.code,
        name: newVehicle.name,
        category_id: categoryId,
        store_id: storeId,
        status_id: statusId,
        last_mileage: newVehicle.lastMileage
      } as any)
    
    if (error) throw error

    // Success
    isAddModalOpen.value = false
    // Reset form
    newVehicle.code = ''
    newVehicle.name = ''
    newVehicle.lastMileage = 0
    
    await fetchVehicles()
  } catch (e) {
    console.error('Add failed:', e)
    alert('Failed to add vehicle. Check console for details.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchVehicles()
})

const selectedVehicle = ref<Vehicle | null>(null)

const filteredVehicles = computed<Vehicle[]>(() => {
  return (vehicles.value || []).filter((v: Vehicle) => {
    const matchesSearch = (v.name || '').toLowerCase().includes(search.value.toLowerCase()) || 
                         (v.id || '').toLowerCase().includes(search.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All' || v.category === selectedCategory.value
    const matchesStatus = selectedStatus.value === 'All' || v.status === selectedStatus.value
    return !!(matchesSearch && matchesCategory && matchesStatus)
  })
})

function selectVehicle(v: Vehicle) {
  selectedVehicle.value = v
}

async function toggleVehicleStatus() {
  if (!selectedVehicle.value) return
  if (selectedVehicle.value.status === 'Lent') {
    toast.add({ title: 'Operation not allowed', description: 'Cannot change status while the vehicle is lent.', color: 'error' })
    return
  }

  const isCurrentlyAvailable = selectedVehicle.value.status === 'Available'
  const targetStatusName = isCurrentlyAvailable ? 'Unavailable' : 'Available'
  
  const targetStatus = vehicleStatuses.value.find(s => s.name === targetStatusName)
  if (!targetStatus) return

  try {
    const { error } = await client
      .from('vehicles')
      .update({ status_id: targetStatus.id } as any)
      .eq('code', selectedVehicle.value.id)

    if (error) throw error

    toast.add({ title: 'Status Updated', description: `Vehicle is now ${targetStatusName}.`, color: 'success' })
    
    // Refresh data
    await fetchVehicles()
    
    // Close sidebar
    selectedVehicle.value = null
  } catch (e: any) {
    console.error('Update failed:', e)
    toast.add({ title: 'Update Failed', description: e.message, color: 'error' })
  }
}
</script>

<template>
  <div class="flex flex-1 overflow-hidden -m-6 h-[calc(100vh-64px)]">
    <main class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden min-w-[600px]">
      <!-- Sub Header / Filters -->
      <div class="flex flex-col gap-4 p-6 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-bold leading-tight text-slate-900 dark:text-white">Vehicle List</h1>
            <p class="text-slate-500 dark:text-slate-400 text-sm">Manage and track all vehicles across locations.</p>
          </div>
          <UButton
            label="Add Vehicle"
            icon="i-lucide-plus"
            color="primary"
            size="md"
            class="cursor-pointer"
            @click="isAddModalOpen = true"
          />
        </div>

        <div class="flex items-center gap-4 mt-2">
          <div class="flex-1 relative">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Search vehicles..."
              size="md"
              class="w-full"
            />
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <span class="text-[10px] font-bold text-slate-400 px-2 uppercase">Category</span>
              <div class="flex items-center gap-1">
                <button
                  v-for="cat in categories"
                  :key="cat"
                  @click="selectedCategory = cat"
                  :class="[
                    'px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
                    selectedCategory === cat 
                       ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  ]"
                >
                  {{ cat }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <span class="text-[10px] font-bold text-slate-400 px-2 uppercase">Status</span>
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
        </div>
      </div>

      <!-- Table Area -->
      <div class="flex-1 overflow-auto p-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-sm">
          <div v-if="isLoadingVehicles" class="p-8 text-center text-slate-500">
            <UIcon name="i-lucide-loader-2" class="animate-spin size-8 mb-2" />
            <p>Loading vehicles...</p>
          </div>
          <table v-else class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Name</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Updated</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              <tr
                v-for="v in filteredVehicles"
                :key="v.id"
                @click="selectVehicle(v)"
                :class="[
                  'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
                  selectedVehicle?.id === v.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <UIcon :name="v.icon" class="size-6" />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-slate-900 dark:text-white">{{ v.name }}</div>
                      <div class="text-sm text-slate-500 dark:text-slate-400">{{ v.category }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600 dark:text-slate-400">{{ v.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge
                    :label="v.status"
                    :color="v.statusColor as any"
                    variant="subtle"
                    class="rounded-full"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{{ v.lastUpdated }}</td>
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
                  No vehicles found matching your criteria.
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Pagination Mock -->
          <div class="bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 sm:px-6 font-medium">
            <p class="text-sm text-slate-700 dark:text-slate-300">
              Showing <span class="font-bold">1</span> to <span class="font-bold">{{ filteredVehicles.length }}</span> of <span class="font-bold">{{ filteredVehicles.length }}</span> results
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
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Vehicle Details</h3>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="selectedVehicle = null"
          />
        </div>

        <div class="flex flex-col items-center mb-6">
          <div class="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-4 border border-slate-200 dark:border-slate-800 overflow-hidden">
            <img v-if="selectedVehicle.imageUrl" :src="selectedVehicle.imageUrl" class="w-full h-full object-cover" />
            <UIcon v-else :name="selectedVehicle.icon" class="text-6xl" />
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white text-center">{{ selectedVehicle.name }}</h2>
          <p class="text-slate-500 dark:text-slate-400 font-mono text-sm mt-1">{{ selectedVehicle.id }}</p>
          <div class="mt-4">
            <UBadge
              :label="selectedVehicle.status"
              :color="selectedVehicle.statusColor as any"
              variant="subtle"
              class="rounded-full px-4"
            />
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800 py-4 flex flex-col gap-4">
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Category</p>
            <span class="text-sm text-slate-900 dark:text-white font-medium">{{ selectedVehicle.category }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Status Access</p>
              <span class="text-sm text-slate-900 dark:text-white font-medium">
                {{ selectedVehicle.status === 'Available' ? 'Ready for Use' : selectedVehicle.status === 'Lent' ? 'Currently Lent' : 'Under Maintenance' }}
              </span>
            </div>
            <UButton
              v-if="selectedVehicle.status !== 'Lent'"
              :label="selectedVehicle.status === 'Available' ? 'Set Unavailable' : 'Set Available'"
              :variant="selectedVehicle.status === 'Available' ? 'subtle' : 'solid'"
              :color="selectedVehicle.status === 'Available' ? 'error' : 'success'"
              size="xs"
              class="cursor-pointer"
              @click="toggleVehicleStatus"
            />
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Last Mileage</p>
            <span class="text-sm text-slate-900 dark:text-white font-medium">{{ selectedVehicle.lastMileage.toLocaleString() }} km</span>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-800 py-4 mt-auto">
          <div class="flex flex-col gap-2">
            <UButton
              label="Process Return"
              icon="i-lucide-corner-down-left"
              block
              color="primary"
              variant="solid"
              class="cursor-pointer"
            />
            <UButton
              label="Print QR Code"
              icon="i-lucide-qr-code"
              block
              color="neutral"
              variant="outline"
              class="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </aside>

    <!-- Add Vehicle Modal -->
    <UModal v-model:open="isAddModalOpen" title="Register New Vehicle" description="Enter the vehicle details to add it to the inventory.">
      <template #body>
        <UForm :state="newVehicle" class="space-y-4" @submit="handleAddVehicle">
          <UFormField label="Vehicle ID (Code)" name="code" required>
            <UInput v-model="newVehicle.code" placeholder="e.g. B-HONDA-123" />
          </UFormField>

          <UFormField label="Vehicle Name" name="name" required>
            <UInput v-model="newVehicle.name" placeholder="e.g. Honda PCX 150" />
          </UFormField>

          <UFormField label="Category" name="categoryName" required>
            <URadioGroup v-model="newVehicle.categoryName" :items="categoryOptions" orientation="horizontal" />
          </UFormField>

          <UFormField label="Initial Mileage (km)" name="lastMileage">
            <UInput v-model.number="newVehicle.lastMileage" type="number" />
          </UFormField>

          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" variant="ghost" color="neutral" class="cursor-pointer" @click="isAddModalOpen = false" />
            <UButton label="Save Vehicle" type="submit" color="primary" class="cursor-pointer" :loading="isSubmitting" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
