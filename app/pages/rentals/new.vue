<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()

const currentStep = ref(1) // 1: Customer, 2: Vehicle Scan, 3: Confirmation
const isLoading = ref(false)

// Step 1: Customer Selection
const customers = ref<any[]>([])
const selectedCustomer = ref<any>(null)
const customerSearch = ref('')

async function fetchActiveCustomers() {
  isLoading.value = true
  const { data: statusData } = await (supabase.from('customer_statuses').select('id').eq('name', 'Active').single() as any)
  if (!statusData) return
  
  const { data, error } = await (supabase
    .from('customers')
    .select('*')
    .eq('status_id', statusData.id)
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
}

// Step 2: Vehicle Scan (Mock for now)
const scannedVehicle = ref<any>(null)
const isScanning = ref(false)

async function simulateScan() {
  isScanning.value = true
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Scanned code: B-HONDA-001 (example)
  const { data, error } = await (supabase
    .from('vehicles')
    .select('*, vehicle_categories(name, icon), vehicle_statuses(name)')
    .eq('status_id', (await (supabase.from('vehicle_statuses').select('id').eq('name', 'Available').single() as any)).data?.id)
    .limit(1)
    .single() as any)

  if (data) {
    scannedVehicle.value = data
    currentStep.value = 3
  } else {
    toast.add({ title: 'Scan Failed', description: 'No available vehicle found.', color: 'error' })
  }
  isScanning.value = false
}

// Step 3: Confirmation & Process
const isSubmitting = ref(false)

async function handleCompleteLending() {
  if (!selectedCustomer.value || !scannedVehicle.value) return
  isSubmitting.value = true
  
  try {
    // 1. Get Status IDs
    const { data: vStatus } = await (supabase.from('vehicle_statuses').select('id').eq('name', 'Lent').single() as any)
    const { data: cStatus } = await (supabase.from('customer_statuses').select('id').eq('name', 'Renting').single() as any)
    
    // 2. Insert Rental
    const { error: rentalError } = await (supabase.from('rentals').insert({
      vehicle_id: scannedVehicle.value.id,
      customer_id: selectedCustomer.value.id,
      start_at: new Date().toISOString(),
      start_mileage: scannedVehicle.value.last_mileage || 0,
      status: 'Active'
    } as any) as any)
    if (rentalError) throw rentalError

    // 3. Update Vehicle Status
    await ((supabase.from('vehicles') as any).update({ status_id: vStatus?.id }).eq('id', scannedVehicle.value.id) as any)
    
    // 4. Update Customer Status
    await ((supabase.from('customers') as any).update({ status_id: cStatus?.id }).eq('id', selectedCustomer.value.id) as any)

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
        <div v-for="step in 3" :key="step" 
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
    <div v-if="currentStep === 2" class="flex flex-col items-center justify-center py-10 space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold">Step 2: Scan Vehicle QR</h2>
        <p class="text-slate-500">Point the camera at the vehicle's QR code.</p>
      </div>

      <!-- Scanner Simulation Box -->
      <div class="relative w-72 h-72 bg-slate-950 rounded-3xl overflow-hidden border-4 border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center">
        <div v-if="isScanning" class="absolute inset-x-0 top-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-bounce-vertical"></div>
        <UIcon name="i-lucide-camera" :class="['size-16 text-slate-800', isScanning ? 'animate-pulse' : '']" />
      </div>

      <div class="flex flex-col gap-3 w-72">
        <UButton
          label="Simulate QR Scan"
          icon="i-lucide-qr-code"
          size="xl"
          block
          :loading="isScanning"
          class="cursor-pointer"
          @click="simulateScan"
        />
        <p class="text-xs text-center text-slate-400">Mocking a successful scan of an available vehicle.</p>
      </div>
    </div>

    <!-- Step 3: Confirmation -->
    <div v-if="currentStep === 3 && selectedCustomer && scannedVehicle" class="space-y-6">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold">Step 3: Confirm Transaction</h2>
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
              <p class="text-sm text-slate-500">{{ selectedCustomer.phone }}</p>
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
              <p class="text-sm text-slate-500">{{ scannedVehicle.vehicle_categories?.name }} • {{ scannedVehicle.code }}</p>
              <p class="text-sm text-slate-500">Current Mileage: {{ scannedVehicle.last_mileage }} km</p>
            </div>
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
          class="cursor-pointer max-w-sm"
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
