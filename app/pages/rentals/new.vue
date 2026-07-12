<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()
const { staff: currentStaff } = useStaff()
const { formatPrice } = useCurrency()
const { ensureLoaded, vehicleStatusId, customerStatusId } = useStatusIds()

const currentStep = ref(1) // 1: Customer, 2: Vehicle Scan, 3: Return Date, 4: Price Input, 5: Confirmation
const isLoading = ref(false)

// Step 1: Customer Selection
const customers = ref<any[]>([])
const selectedCustomer = ref<any>(null)
const customerSearch = ref('')

async function fetchActiveCustomers() {
  isLoading.value = true
  await ensureLoaded()
  const statusId = customerStatusId('Active')
  if (!statusId) return

  const { data, error } = await (supabase
    .from('customers')
    .select('*')
    .eq('status_id', statusId)
    .order('full_name') as any)
  
  if (!error) customers.value = data || []
  isLoading.value = false
}

const filteredCustomers = computed(() => {
  const s = customerSearch.value.toLowerCase()
  return customers.value.filter(c => 
    c.full_name.toLowerCase().includes(s) || (c.email && c.email.toLowerCase().includes(s))
  )
})

function selectCustomer(customer: any) {
  selectedCustomer.value = customer
  currentStep.value = 2
  fetchAvailableVehicles()
}

// Step 2: Vehicle Scan & Identification
const scannedVehicle = ref<any>(null)
const isScanning = ref(false)
const manualVehicleCode = ref('')
const isIdentifying = ref(false)

// Vehicle list selection
const availableVehicles = ref<any[]>([])
const isLoadingVehicles = ref(false)
const vehicleSearch = ref('')

async function fetchAvailableVehicles() {
  isLoadingVehicles.value = true
  try {
    await ensureLoaded()
    const statusId = vehicleStatusId('Available')
    if (!statusId) return

    const { data, error } = await (supabase
      .from('vehicles')
      .select('*, vehicle_categories(name, icon), vehicle_statuses(name)')
      .eq('status_id', statusId)
      .order('name') as any)

    if (!error) availableVehicles.value = data || []
  } catch (e: any) {
    toast.add({ title: 'Error', description: 'Could not load available vehicles.', color: 'error' })
  } finally {
    isLoadingVehicles.value = false
  }
}

const filteredVehicles = computed(() => {
  const s = vehicleSearch.value.toLowerCase()
  return availableVehicles.value.filter(v =>
    v.name.toLowerCase().includes(s) ||
    v.code.toLowerCase().includes(s) ||
    (v.vehicle_categories?.name && v.vehicle_categories.name.toLowerCase().includes(s))
  )
})

function selectVehicleFromList(vehicle: any) {
  scannedVehicle.value = vehicle
  currentStep.value = 3
}

async function identifyVehicleByCode(code: string) {
  isIdentifying.value = true
  try {
    await ensureLoaded()
    const statusId = vehicleStatusId('Available')

    const { data, error } = await (supabase
      .from('vehicles')
      .select('*, vehicle_categories(name, icon), vehicle_statuses(name)')
      .eq('code', code)
      .eq('status_id', statusId)
      .single() as any)

    if (data) {
      scannedVehicle.value = data
      currentStep.value = 3
    } else {
      toast.add({ title: 'Identification Failed', description: 'Vehicle not found or not available.', color: 'error' })
    }
  } catch (e: any) {
    toast.add({ title: 'Error', description: 'Could not identify vehicle.', color: 'error' })
  } finally {
    isIdentifying.value = false
  }
}

async function simulateScan() {
  isScanning.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // For simulation, we'll try to get ANY available vehicle
  await ensureLoaded()
  const statusId = vehicleStatusId('Available')
  const { data } = await (supabase
    .from('vehicles')
    .select('code')
    .eq('status_id', statusId)
    .limit(1)
    .single() as any)

  if (data) {
    await identifyVehicleByCode(data.code)
  } else {
    toast.add({ title: 'Scan Failed', description: 'No available vehicle found.', color: 'error' })
  }
  isScanning.value = false
}

// Step 3: Return Date & Time
const returnDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0]) // Default +1 day
const returnTime = ref('10:00')

const formattedReturnAt = computed(() => {
  if (!returnDate.value || !returnTime.value) return ''
  return `${returnDate.value} ${returnTime.value}`
})

const durationText = computed(() => {
  if (!formattedReturnAt.value) return ''
  const start = new Date()
  const end = new Date(formattedReturnAt.value)
  const diffMs = end.getTime() - start.getTime()
  if (diffMs < 0) return 'Invalid (Past date)'

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffHours / 24)
  const hours = diffHours % 24

  if (days === 0) return `${hours} hours`
  return `${days} days ${hours} hours`
})

const isPastDate = computed(() => {
  if (!formattedReturnAt.value) return true
  const start = new Date()
  const end = new Date(formattedReturnAt.value)
  return end.getTime() <= start.getTime()
})

// Step 4: Price Input
const price = ref(0)
const isPriceValid = computed(() => price.value >= 0)

// Step 5: Confirmation & Process
const isSubmitting = ref(false)

async function handleCompleteLending() {
  if (!selectedCustomer.value || !scannedVehicle.value) return
  isSubmitting.value = true
  
  try {
    // 1. Get Status IDs
    await ensureLoaded()
    const lentStatusId = vehicleStatusId('Lent')
    const rentingStatusId = customerStatusId('Renting')
    
    // 1.5 Validate Staff and Store Info
    if (!currentStaff.value?.id || !currentStaff.value?.store_id) {
      toast.add({ title: 'Authentication Error', description: 'Could not identify your store. Please try logging in again.', color: 'error' })
      return
    }
    const staffId = currentStaff.value.id
    const storeId = currentStaff.value.store_id

    // 2. Insert Transaction
    const { error: rentalError } = await (supabase.from('transactions').insert({
      vehicle_id: scannedVehicle.value.id,
      customer_id: selectedCustomer.value.id,
      staff_id: staffId,
      store_id: storeId,
      start_at: new Date().toISOString(),
      end_at: new Date(formattedReturnAt.value).toISOString(),
      start_mileage: scannedVehicle.value.last_mileage || 0,
      price: price.value,
      status: 'Active'
    } as any) as any)
    if (rentalError) throw rentalError

    // 3. Update Vehicle Status
    await ((supabase.from('vehicles') as any).update({ status_id: lentStatusId }).eq('id', scannedVehicle.value.id) as any)

    // 4. Update Customer Status
    await ((supabase.from('customers') as any).update({ status_id: rentingStatusId }).eq('id', selectedCustomer.value.id) as any)

    toast.add({ title: 'Lending Success', description: 'Transaction completed successfully.', color: 'success' })
    router.push('/')
  } catch (e: any) {
    toast.add({ title: 'Lending Failed', description: e.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchActiveCustomers()
})
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-20">
    <!-- Header with Breadcrumbs/Progress -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" class="cursor-pointer" @click="currentStep > 1 ? currentStep-- : router.back()" />
        <h1 class="text-2xl font-bold">New Lending</h1>
      </div>
      
      <!-- Progress Indicator -->
      <div class="flex items-center gap-2">
        <div v-for="step in 5" :key="step" 
          :class="['h-2 w-8 rounded-full transition-colors', currentStep >= step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800']" 
        />
      </div>
    </div>

    <!-- Step 1: Customer Selection -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Step 1: Select Customer</h2>
        <p class="text-slate-500 text-sm">Only active customers are shown.</p>
      </div>

      <UInput
        v-model="customerSearch"
        icon="i-lucide-search"
        placeholder="Search customers by name or email..."
        size="lg"
        class="w-full"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="isLoading" class="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin mb-2" />
          <p>Loading customers...</p>
        </div>
        <UCard
          v-for="customer in filteredCustomers"
          :key="customer.id"
          class="cursor-pointer hover:border-blue-500 transition-all border-slate-200 dark:border-slate-800 shadow-sm"
          @click="selectCustomer(customer)"
        >
          <div class="flex items-center gap-4">
            <UAvatar :alt="customer.full_name" size="md" />
            <div class="flex-1">
              <p class="font-bold text-slate-900 dark:text-white">{{ customer.full_name }}</p>
              <p class="text-xs text-slate-500">{{ customer.email || 'No email' }}</p>
            </div>
            <UIcon name="i-lucide-chevron-right" class="text-slate-400" />
          </div>
        </UCard>
        <div v-if="filteredCustomers.length === 0 && !isLoading" class="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No active customers found.
        </div>
      </div>
    </div>

    <!-- Step 2: Vehicle Scan -->
    <div v-if="currentStep === 2" class="space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold">Step 2: Select Vehicle</h2>
        <p class="text-slate-500">Choose a vehicle from the list, scan QR, or enter ID manually.</p>
      </div>

      <!-- Available Vehicle List -->
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-list" class="size-5 text-blue-600" />
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Available Vehicles</h3>
          <UBadge :label="`${availableVehicles.length}`" color="info" variant="subtle" size="sm" />
        </div>

        <UInput
          v-model="vehicleSearch"
          icon="i-lucide-search"
          placeholder="Search by name, code, or category..."
          size="lg"
          class="w-full"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
          <div v-if="isLoadingVehicles" class="col-span-full py-8 flex flex-col items-center justify-center text-slate-500">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin mb-2" />
            <p>Loading vehicles...</p>
          </div>
          <UCard
            v-for="vehicle in filteredVehicles"
            :key="vehicle.id"
            class="cursor-pointer hover:border-blue-500 transition-all border-slate-200 dark:border-slate-800 shadow-sm"
            @click="selectVehicleFromList(vehicle)"
          >
            <div class="flex items-center gap-4">
              <div class="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                <UIcon :name="vehicle.vehicle_categories?.icon || 'i-lucide-package'" class="size-6" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-900 dark:text-white truncate">{{ vehicle.name }}</p>
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span class="font-mono">{{ vehicle.code }}</span>
                  <span>•</span>
                  <span>{{ vehicle.vehicle_categories?.name || 'Unknown' }}</span>
                </div>
              </div>
              <UIcon name="i-lucide-chevron-right" class="text-slate-400 shrink-0" />
            </div>
          </UCard>
          <div v-if="filteredVehicles.length === 0 && !isLoadingVehicles" class="col-span-full py-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No available vehicles found.
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-4 py-2">
        <div class="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
        <div class="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
      </div>

      <!-- QR Scan & Manual Entry -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-4xl mx-auto">
        <!-- QR Section -->
        <div class="flex flex-col items-center space-y-6 border-r border-slate-200 dark:border-slate-800 pr-0 md:pr-12">
           <div class="relative w-56 h-56 bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border-4 border-slate-200 dark:border-slate-800">
             <div v-if="isScanning" class="absolute inset-x-0 top-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-bounce-vertical"></div>
             <UIcon name="i-lucide-qr-code" :class="['size-12 text-slate-800', isScanning ? 'animate-pulse' : '']" />
           </div>
           <UButton
             label="Simulate QR Scan"
             icon="i-lucide-camera"
             size="xl"
             block
             :loading="isScanning"
             class="cursor-pointer font-bold"
             @click="simulateScan"
           />
        </div>

        <!-- Manual Entry Section -->
        <div class="space-y-6">
          <div class="space-y-4">
            <UFormField label="Vehicle ID (Code)" name="manualCode">
              <UInput
                v-model="manualVehicleCode"
                placeholder="e.g. B-HONDA-001"
                size="xl"
                icon="i-lucide-keyboard"
                class="bg-white dark:bg-slate-900"
              />
            </UFormField>
            <UButton
              label="Identify Vehicle"
              color="primary"
              size="xl"
              block
              :loading="isIdentifying"
              :disabled="!manualVehicleCode"
              class="cursor-pointer font-bold shadow-lg shadow-blue-500/20"
              @click="identifyVehicleByCode(manualVehicleCode)"
            />
          </div>
          
          <div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <p class="text-xs text-slate-500 leading-relaxed">
              <UIcon name="i-lucide-info" class="inline-block mr-1" />
              Ensure the vehicle is available for lending before identifying.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Return Date & Time Selection -->
    <div v-if="currentStep === 3" class="space-y-6 flex flex-col items-center">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold font-heading">Step 3: Return Schedule</h2>
        <p class="text-slate-500">When is the customer planning to return the vehicle?</p>
      </div>

      <UCard class="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div class="p-6 space-y-6">
          <UFormField label="Return Date" name="returnDate">
            <UInput
              v-model="returnDate"
              type="date"
              size="xl"
              icon="i-lucide-calendar"
            />
          </UFormField>

          <UFormField label="Return Time" name="returnTime">
            <UInput
              v-model="returnTime"
              type="time"
              size="xl"
              icon="i-lucide-clock"
            />
          </UFormField>

          <div :class="['p-5 rounded-xl border transition-colors', isPastDate ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800']">
            <div class="flex items-center gap-3 mb-3">
              <UIcon :name="isPastDate ? 'i-lucide-alert-triangle' : 'i-lucide-calendar-clock'" :class="['size-6', isPastDate ? 'text-red-500' : 'text-blue-600']" />
              <p :class="['text-xs font-bold uppercase tracking-wider', isPastDate ? 'text-red-500' : 'text-blue-600']">
                {{ isPastDate ? 'Invalid Return Schedule' : 'Scheduled Return' }}
              </p>
            </div>
            <div class="space-y-3">
              <p :class="['font-bold text-xl', isPastDate ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white']">
                {{ formattedReturnAt }}
              </p>
              <div :class="['h-px w-full', isPastDate ? 'bg-red-200 dark:bg-red-700' : 'bg-blue-200 dark:bg-blue-700']"></div>
              <p :class="['font-bold text-xl flex items-center gap-2', isPastDate ? 'text-red-500' : 'text-blue-600 dark:text-blue-400']">
                <UIcon :name="isPastDate ? 'i-lucide-x-circle' : 'i-lucide-timer'" class="size-6" />
                {{ isPastDate ? 'Return date must be in the future' : durationText }}
              </p>
            </div>
          </div>

          <UButton
            label="Continue to Price Input"
            color="primary"
            size="xl"
            block
            :disabled="isPastDate"
            class="cursor-pointer font-bold"
            @click="currentStep = 4"
          />
        </div>
      </UCard>
    </div>

    <!-- Step 4: Price Input -->
    <div v-if="currentStep === 4" class="space-y-6 flex flex-col items-center">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold font-heading">Step 4: Payment Amount</h2>
        <p class="text-slate-500">Enter the rental fee for this transaction.</p>
      </div>

      <UCard class="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div class="p-6 space-y-6">
          <UFormField label="Rental Price" name="price">
            <UInput
              v-model="price"
              type="number"
              size="xl"
              icon="i-lucide-banknote"
              :placeholder="`0 (${formatPrice(0).split(' ')[0]})`"
            />
          </UFormField>

          <UButton
            label="Continue to Confirmation"
            color="primary"
            size="xl"
            block
            :disabled="!isPriceValid"
            class="cursor-pointer font-bold"
            @click="currentStep = 5"
          />
        </div>
      </UCard>
    </div>

    <!-- Step 5: Confirmation -->
    <div v-if="currentStep === 5 && selectedCustomer && scannedVehicle" class="space-y-6">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold">Step 5: Confirm Transaction</h2>
        <p class="text-slate-500">Please review the lending details below.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Customer Details -->
        <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
          <template #header><p class="font-bold">Customer</p></template>
          <div class="flex items-center gap-4">
            <UAvatar :alt="selectedCustomer.full_name" size="lg" />
            <div>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedCustomer.full_name }}</p>
              <p class="text-sm text-slate-500">{{ selectedCustomer.email }}</p>
            </div>
          </div>
        </UCard>

        <!-- Vehicle Details -->
        <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
          <template #header><p class="font-bold">Vehicle</p></template>
          <div class="flex items-center gap-4">
            <div class="size-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
               <UIcon :name="scannedVehicle.vehicle_categories?.icon || 'i-lucide-package'" class="size-8" />
            </div>
            <div>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ scannedVehicle.name }}</p>
              <p class="text-sm text-slate-500">{{ scannedVehicle.code }} • {{ scannedVehicle.last_mileage }} km</p>
            </div>
          </div>
        </UCard>

        <!-- Schedule Summary -->
        <UCard class="border-slate-200 dark:border-slate-800 shadow-sm bg-blue-50/30 dark:bg-blue-900/5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="size-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center text-blue-600">
                <UIcon name="i-lucide-calendar-check" class="size-6" />
              </div>
              <div class="flex-1">
                <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Return Schedule</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">{{ formattedReturnAt }}</p>
                <div class="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                <p class="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <UIcon name="i-lucide-timer" class="size-5" />
                  {{ durationText }}
                </p>
              </div>
            </div>
            <UButton label="Change" variant="ghost" color="primary" class="cursor-pointer" @click="currentStep = 3" />
          </div>
        </UCard>

        <!-- Price Summary -->
        <UCard class="border-slate-200 dark:border-slate-800 shadow-sm bg-orange-50/30 dark:bg-orange-900/5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="size-10 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center text-orange-600">
                <UIcon name="i-lucide-banknote" class="size-6" />
              </div>
              <div class="flex-1">
                <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Payment Amount</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ formatPrice(price) }}</p>
              </div>
            </div>
            <UButton label="Change" variant="ghost" color="primary" class="cursor-pointer" @click="currentStep = 4" />
          </div>
        </UCard>
      </div>

      <div class="flex flex-col gap-4 items-center pt-8">
        <UButton
          label="Start Lending Now"
          size="xl"
          block
          color="primary"
          :loading="isSubmitting"
          class="cursor-pointer max-w-sm font-bold"
          @click="handleCompleteLending"
        />
        <UButton
          label="Cancel and Restart"
          variant="ghost"
          color="neutral"
          class="cursor-pointer"
          @click="currentStep = 1; selectedCustomer = null; scannedVehicle = null"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-vertical {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(280px); }
}
.animate-bounce-vertical {
  animation: bounce-vertical 2.5s infinite ease-in-out;
}
</style>
