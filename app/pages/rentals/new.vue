<script setup lang="ts">
import type { RentalVehicle } from '~/utils/rentalVehicles'
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()
const { staff: currentStaff } = useStaff()
const { t, tName } = useI18n()
const { formatPrice } = useCurrency()
const { ensureLoaded, vehicleStatusId, customerStatusId } = useStatusIds()
const { completeLending } = useRentalTransactions()

const currentStep = ref(1) // 1: Customer, 2: Vehicle Scan, 3: Return Date, 4: Price Input, 5: Confirmation
const isLoading = ref(false)

function handleBack() {
  if (currentStep.value > 1) currentStep.value--
  else router.back()
}

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
  const keyword = customerSearch.value.toLowerCase()
  return customers.value.filter(c => matchesCustomerSearch(c, keyword))
})

function handleSelectCustomer(customer: any) {
  selectedCustomer.value = customer
  currentStep.value = 2
  fetchAvailableVehicles()
}

// Step 2: Vehicle Scan & Identification
const selectedVehicle = ref<any>(null)
const isScanning = ref(false)
const manualVehicleCode = ref('')
const isIdentifying = ref(false)

// Vehicle list selection
const {
  vehicles: availableVehicles,
  isLoadingVehicles,
  vehicleSearch,
  filteredVehicles,
  fetchVehicles: fetchAvailableVehicles
} = useRentalVehicles('Available', t('rent.load_available_failed'))

function handleSelectVehicle(vehicle: RentalVehicle) {
  selectedVehicle.value = vehicle
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
      selectedVehicle.value = data
      currentStep.value = 3
    } else {
      toast.add({ title: t('lend.s2.id_failed'), description: t('lend.s2.id_failed_desc'), color: 'error' })
    }
  } catch (e: any) {
    toast.add({ title: t('error'), description: t('lend.s2.id_error'), color: 'error' })
  } finally {
    isIdentifying.value = false
  }
}

/** シミュレーション用に Available な車両を1台取得する */
async function fetchAnyAvailableVehicle(): Promise<{ code: string } | null> {
  await ensureLoaded()
  const statusId = vehicleStatusId('Available')
  const { data } = await (supabase
    .from('vehicles')
    .select('code')
    .eq('status_id', statusId)
    .limit(1)
    .single() as any)
  return data
}

async function handleSimulateScan() {
  isScanning.value = true
  try {
    await waitForSimulatedScan()
    const vehicle = await fetchAnyAvailableVehicle()
    if (vehicle) {
      await identifyVehicleByCode(vehicle.code)
    } else {
      toast.add({ title: t('lend.s2.scan_failed'), description: t('lend.s2.scan_failed_desc'), color: 'error' })
    }
  } finally {
    isScanning.value = false
  }
}

// Step 3: Return Date & Time
const returnDate = ref(new Date(Date.now() + 86400000).toISOString().split('T')[0]) // Default +1 day
const returnTime = ref('10:00')

const formattedReturnAt = computed(() => {
  if (!returnDate.value || !returnTime.value) return ''
  return `${returnDate.value} ${returnTime.value}`
})

const durationText = computed(() => toLendingDurationText(formattedReturnAt.value, new Date(), t))

const isPastDate = computed(() => isReturnAtNotInFuture(formattedReturnAt.value, new Date()))

// Step 4: Price Input
const price = ref(0)
const isPriceValid = computed(() => price.value >= 0)

// Step 5: Confirmation & Process
const isSubmitting = ref(false)

async function handleCompleteLending() {
  if (!selectedCustomer.value || !selectedVehicle.value) return
  isSubmitting.value = true

  try {
    if (!currentStaff.value?.id || !currentStaff.value?.store_id) {
      toast.add({ title: t('lend.toast.auth'), description: t('lend.toast.auth_desc'), color: 'error' })
      return
    }

    await completeLending({
      vehicle_id:    selectedVehicle.value.id,
      customer_id:   selectedCustomer.value.id,
      staff_id:      currentStaff.value.id,
      store_id:      currentStaff.value.store_id,
      start_at:      new Date().toISOString(),
      end_at:        new Date(formattedReturnAt.value).toISOString(),
      start_mileage: selectedVehicle.value.last_mileage || 0,
      price:         price.value,
    })

    toast.add({ title: t('lend.toast.success'), description: t('lend.toast.success_desc'), color: 'success' })
    router.push('/dashboard')
  } catch (e: any) {
    toast.add({ title: t('lend.toast.failed'), description: e.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}

function handleRestart() {
  currentStep.value = 1
  selectedCustomer.value = null
  selectedVehicle.value = null
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
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" class="cursor-pointer" @click="handleBack" />
        <h1 class="text-2xl font-bold">{{ t('lend.title') }}</h1>
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
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">{{ t('lend.s1.title') }}</h2>
        <p class="text-slate-500 text-sm">{{ t('lend.s1.desc') }}</p>
      </div>

      <UInput
        v-model="customerSearch"
        icon="i-lucide-search"
        :placeholder="t('lend.s1.search')"
        size="lg"
        class="w-full"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-if="isLoading" class="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
          <UIcon name="i-lucide-loader-2" class="size-8 animate-spin mb-2" />
          <p>{{ t('lend.s1.loading') }}</p>
        </div>
        <UCard
          v-for="customer in filteredCustomers"
          :key="customer.id"
          class="cursor-pointer hover:border-blue-500 transition-all border-slate-200 dark:border-slate-800 shadow-sm"
          @click="handleSelectCustomer(customer)"
        >
          <div class="flex items-center gap-4">
            <UAvatar :alt="customer.full_name" size="md" />
            <div class="flex-1">
              <p class="font-bold text-slate-900 dark:text-white">{{ customer.full_name }}</p>
              <p class="text-xs text-slate-500">{{ customer.email || t('lend.s1.no_email') }}</p>
            </div>
            <UIcon name="i-lucide-chevron-right" class="text-slate-400" />
          </div>
        </UCard>
        <div v-if="filteredCustomers.length === 0 && !isLoading" class="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          {{ t('lend.s1.empty') }}
        </div>
      </div>
    </div>

    <!-- Step 2: Vehicle Scan -->
    <div v-if="currentStep === 2" class="space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold">{{ t('lend.s2.title') }}</h2>
        <p class="text-slate-500">{{ t('lend.s2.desc') }}</p>
      </div>

      <!-- Available Vehicle List -->
      <div class="space-y-4">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-list" class="size-5 text-blue-600" />
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ t('lend.s2.list_title') }}</h3>
          <UBadge :label="`${availableVehicles.length}`" color="info" variant="subtle" size="sm" />
        </div>

        <UInput
          v-model="vehicleSearch"
          icon="i-lucide-search"
          :placeholder="t('rent.search_vehicle_ph')"
          size="lg"
          class="w-full"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
          <div v-if="isLoadingVehicles" class="col-span-full py-8 flex flex-col items-center justify-center text-slate-500">
            <UIcon name="i-lucide-loader-2" class="size-8 animate-spin mb-2" />
            <p>{{ t('rent.loading_vehicles') }}</p>
          </div>
          <UCard
            v-for="vehicle in filteredVehicles"
            :key="vehicle.id"
            class="cursor-pointer hover:border-blue-500 transition-all border-slate-200 dark:border-slate-800 shadow-sm"
            @click="handleSelectVehicle(vehicle)"
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
                  <span>{{ tName('category', vehicle.vehicle_categories?.name) }}</span>
                </div>
              </div>
              <UIcon name="i-lucide-chevron-right" class="text-slate-400 shrink-0" />
            </div>
          </UCard>
          <div v-if="filteredVehicles.length === 0 && !isLoadingVehicles" class="col-span-full py-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            {{ t('lend.s2.empty') }}
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-4 py-2">
        <div class="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
        <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ t('or') }}</span>
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
             :label="t('rent.simulate_scan')"
             icon="i-lucide-camera"
             size="xl"
             block
             :loading="isScanning"
             class="cursor-pointer font-bold"
             @click="handleSimulateScan"
           />
        </div>

        <!-- Manual Entry Section -->
        <div class="space-y-6">
          <div class="space-y-4">
            <UFormField :label="t('rent.vehicle_id_code')" name="manualCode">
              <UInput
                v-model="manualVehicleCode"
                :placeholder="t('rent.vehicle_id_ph')"
                size="xl"
                icon="i-lucide-keyboard"
                class="bg-white dark:bg-slate-900"
              />
            </UFormField>
            <UButton
              :label="t('lend.s2.identify')"
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
              {{ t('lend.s2.hint') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Return Date & Time Selection -->
    <div v-if="currentStep === 3" class="space-y-6 flex flex-col items-center">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold font-heading">{{ t('lend.s3.title') }}</h2>
        <p class="text-slate-500">{{ t('lend.s3.desc') }}</p>
      </div>

      <UCard class="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div class="p-6 space-y-6">
          <UFormField :label="t('lend.s3.date')" name="returnDate">
            <UInput
              v-model="returnDate"
              type="date"
              size="xl"
              icon="i-lucide-calendar"
            />
          </UFormField>

          <UFormField :label="t('lend.s3.time')" name="returnTime">
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
                {{ isPastDate ? t('lend.s3.invalid') : t('lend.s3.scheduled') }}
              </p>
            </div>
            <div class="space-y-3">
              <p :class="['font-bold text-xl', isPastDate ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white']">
                {{ formattedReturnAt }}
              </p>
              <div :class="['h-px w-full', isPastDate ? 'bg-red-200 dark:bg-red-700' : 'bg-blue-200 dark:bg-blue-700']"></div>
              <p :class="['font-bold text-xl flex items-center gap-2', isPastDate ? 'text-red-500' : 'text-blue-600 dark:text-blue-400']">
                <UIcon :name="isPastDate ? 'i-lucide-x-circle' : 'i-lucide-timer'" class="size-6" />
                {{ isPastDate ? t('lend.s3.must_future') : durationText }}
              </p>
            </div>
          </div>

          <UButton
            :label="t('lend.s3.continue')"
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
        <h2 class="text-2xl font-bold font-heading">{{ t('lend.s4.title') }}</h2>
        <p class="text-slate-500">{{ t('lend.s4.desc') }}</p>
      </div>

      <UCard class="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div class="p-6 space-y-6">
          <UFormField :label="t('lend.s4.price')" name="price">
            <UInput
              v-model="price"
              type="number"
              size="xl"
              icon="i-lucide-banknote"
              :placeholder="`0 (${formatPrice(0).split(' ')[0]})`"
            />
          </UFormField>

          <UButton
            :label="t('lend.s4.continue')"
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
    <div v-if="currentStep === 5 && selectedCustomer && selectedVehicle" class="space-y-6">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold">{{ t('lend.s5.title') }}</h2>
        <p class="text-slate-500">{{ t('lend.s5.desc') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Customer Details -->
        <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
          <template #header><p class="font-bold">{{ t('rent.customer') }}</p></template>
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
          <template #header><p class="font-bold">{{ t('rent.vehicle') }}</p></template>
          <div class="flex items-center gap-4">
            <div class="size-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
               <UIcon :name="selectedVehicle.vehicle_categories?.icon || 'i-lucide-package'" class="size-8" />
            </div>
            <div>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ selectedVehicle.name }}</p>
              <p class="text-sm text-slate-500">{{ selectedVehicle.code }} • {{ selectedVehicle.last_mileage }} km</p>
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
                <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{{ t('lend.s5.schedule') }}</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">{{ formattedReturnAt }}</p>
                <div class="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
                <p class="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <UIcon name="i-lucide-timer" class="size-5" />
                  {{ durationText }}
                </p>
              </div>
            </div>
            <UButton :label="t('rent.change')" variant="ghost" color="primary" class="cursor-pointer" @click="currentStep = 3" />
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
                <p class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{{ t('lend.s5.amount') }}</p>
                <p class="text-2xl font-black text-slate-900 dark:text-white">{{ formatPrice(price) }}</p>
              </div>
            </div>
            <UButton :label="t('rent.change')" variant="ghost" color="primary" class="cursor-pointer" @click="currentStep = 4" />
          </div>
        </UCard>
      </div>

      <div class="flex flex-col gap-4 items-center pt-8">
        <UButton
          :label="t('lend.s5.start')"
          size="xl"
          block
          color="primary"
          :loading="isSubmitting"
          class="cursor-pointer max-w-sm font-bold"
          @click="handleCompleteLending"
        />
        <UButton
          :label="t('lend.s5.restart')"
          variant="ghost"
          color="neutral"
          class="cursor-pointer"
          @click="handleRestart"
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
