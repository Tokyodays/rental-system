<script setup lang="ts">
const supabase = useSupabaseClient()
const toast = useToast()
const router = useRouter()
const route = useRoute()

const currentStep = ref(1) // 1: Vehicle Identification, 2: Confirmation
const isLoading = ref(false)

// Step 1: Vehicle Identification
const manualVehicleCode = ref('')
const isIdentifying = ref(false)
const isScanning = ref(false)
const activeRental = ref<any>(null)

onMounted(() => {
  const code = route.query.code
  if (code && typeof code === 'string') {
    manualVehicleCode.value = code
    identifyVehicleForReturn(code)
  }
})

async function identifyVehicleForReturn(code: string) {
  isIdentifying.value = true
  try {
    // 1. Get vehicle by code
    const { data: vehicle, error: vError } = await (supabase
      .from('vehicles')
      .select('id, name, code, vehicle_categories(name, icon)')
      .eq('code', code)
      .single() as any)

    if (vError || !vehicle) {
      toast.add({ title: 'Vehicle Not Found', description: 'Could not find a vehicle with this ID.', color: 'error' })
      return
    }

    // 2. Find active rental for this vehicle
    const { data: rental, error: rError } = await (supabase
      .from('rentals')
      .select('*, customers(full_name, email, phone)')
      .eq('vehicle_id', vehicle.id)
      .eq('status', 'Active')
      .order('start_at', { ascending: false })
      .limit(1)
      .single() as any)

    if (rError || !rental) {
      toast.add({ title: 'No Active Rental', description: 'This vehicle is not currently lent out.', color: 'error' })
      return
    }

    activeRental.value = { ...rental, vehicle }
    currentStep.value = 2
  } catch (e: any) {
    toast.add({ title: 'Error', description: 'Failed to identify rental.', color: 'error' })
  } finally {
    isIdentifying.value = false
  }
}

async function simulateScan() {
  isScanning.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // For simulation, find ANY active rental vehicle code
  const { data } = await (supabase
    .from('rentals')
    .select('vehicles(code)')
    .eq('status', 'Active')
    .limit(1)
    .single() as any)

  if (data?.vehicles?.code) {
    await identifyVehicleForReturn(data.vehicles.code)
  } else {
    toast.add({ title: 'Scan Failed', description: 'No active rentals found to simulate return.', color: 'error' })
  }
  isScanning.value = false
}

// Step 2: Information Display & Process
const actualReturnAt = ref(new Date())
const isSubmitting = ref(false)

const timeDiffText = computed(() => {
  if (!activeRental.value?.end_at) return ''
  const scheduled = new Date(activeRental.value.end_at)
  const actual = actualReturnAt.value
  const diffMs = actual.getTime() - scheduled.getTime()
  
  const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60))
  const days = Math.floor(diffHours / 24)
  const hours = diffHours % 24
  
  const timeStr = days > 0 ? `${days}d ${hours}h` : `${hours}h`
  
  if (diffMs > 0) return `Delayed by ${timeStr}`
  if (diffMs < 0) return `Early by ${timeStr}`
  return 'Exactly on time'
})

const timeDiffColorClass = computed(() => {
  if (!activeRental.value?.end_at) return ''
  const scheduled = new Date(activeRental.value.end_at)
  const actual = actualReturnAt.value
  return actual.getTime() > scheduled.getTime() ? 'text-red-600' : 'text-green-600'
})

async function handleCompleteReturn() {
  if (!activeRental.value) return
  isSubmitting.value = true
  
  try {
    // 1. Get Status IDs
    const { data: vStatus } = await (supabase.from('vehicle_statuses').select('id').eq('name', 'Available').single() as any)
    const { data: cStatus } = await (supabase.from('customer_statuses').select('id').eq('name', 'Active').single() as any)
    
    // 2. Update Rental Status
    const { error: rError } = await ((supabase.from('rentals') as any)
      .update({ status: 'Completed', end_at: actualReturnAt.value.toISOString() })
      .eq('id', activeRental.value.id) as any)
    if (rError) throw rError

    // 3. Update Vehicle Status
    await ((supabase.from('vehicles') as any).update({ status_id: vStatus?.id }).eq('id', activeRental.value.vehicle_id) as any)
    
    // 4. Update Customer Status
    await ((supabase.from('customers') as any).update({ status_id: cStatus?.id }).eq('id', activeRental.value.customer_id) as any)

    toast.add({ title: 'Return Success', description: 'Vehicle returned successfully.', color: 'success' })
    router.push('/')
  } catch (e: any) {
    toast.add({ title: 'Return Failed', description: e.message, color: 'error' })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" class="cursor-pointer" @click="currentStep > 1 ? currentStep-- : router.back()" />
        <h1 class="text-2xl font-bold">Return Vehicle</h1>
      </div>
      
      <!-- Progress Indicator -->
      <div class="flex items-center gap-2">
        <div v-for="step in 2" :key="step" 
          :class="['h-2 w-8 rounded-full transition-colors', currentStep >= step ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800']" 
        />
      </div>
    </div>

    <!-- Step 1: Vehicle Identification -->
    <div v-if="currentStep === 1" class="flex flex-col items-center justify-center py-10 space-y-10">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold">Step 1: Identify Vehicle</h2>
        <p class="text-slate-500">Scan QR code or enter Vehicle ID to start return.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-4xl">
        <!-- QR Section -->
        <div class="flex flex-col items-center space-y-6 border-r border-slate-200 dark:border-slate-800 pr-0 md:pr-12">
           <div class="relative w-64 h-64 bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border-4 border-slate-200">
             <div v-if="isScanning" class="absolute inset-x-0 top-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-bounce-vertical"></div>
             <UIcon name="i-lucide-qr-code" :class="['size-16 text-slate-800', isScanning ? 'animate-pulse' : '']" />
           </div>
           <UButton
             label="Simulate QR Scan"
             icon="i-lucide-camera"
             size="xl"
             block
             :loading="isScanning"
             class="cursor-pointer"
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
              label="Fetch Lending Info"
              color="primary"
              size="xl"
              block
              :loading="isIdentifying"
              :disabled="!manualVehicleCode"
              class="cursor-pointer font-bold"
              @click="identifyVehicleForReturn(manualVehicleCode)"
            />
          </div>
          
          <div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <p class="text-xs text-slate-500 leading-relaxed">
              <UIcon name="i-lucide-info" class="inline-block mr-1" />
              This will look for an active lending record associated with this vehicle ID.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Confirmation -->
    <div v-if="currentStep === 2 && activeRental" class="space-y-6">
      <div class="text-center space-y-2">
        <h2 class="text-2xl font-bold font-heading">Step 2: Check Return Details</h2>
        <p class="text-slate-500">Confirm the rental period and schedule.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Customer & Vehicle Card -->
        <UCard class="border-slate-200 dark:border-slate-800 shadow-sm">
          <template #header><p class="font-bold">Summary</p></template>
          <div class="space-y-6">
            <div class="flex items-center gap-4">
              <UAvatar :alt="activeRental.customers?.full_name" size="lg" />
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Customer</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">{{ activeRental.customers?.full_name }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div class="size-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-blue-600">
                <UIcon :name="activeRental.vehicle?.vehicle_categories?.icon || 'i-lucide-package'" class="size-8" />
              </div>
              <div>
                <p class="text-xs text-slate-500 font-bold uppercase">Vehicle</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">{{ activeRental.vehicle?.name }}</p>
                <p class="text-sm text-slate-500">{{ activeRental.vehicle?.code }}</p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Time Logic Card -->
        <UCard class="border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <template #header><p class="font-bold text-blue-600">Schedule Status</p></template>
          <div class="space-y-4">
             <div>
               <p class="text-xs text-slate-500 uppercase font-bold tracking-tight mb-1">Scheduled Return</p>
               <p class="text-lg font-bold">{{ new Date(activeRental.end_at).toLocaleString() }}</p>
             </div>
             
             <div class="h-px bg-slate-100 dark:bg-slate-800"></div>

             <div>
               <p class="text-xs text-slate-500 uppercase font-bold tracking-tight mb-1">Actual Return (Now)</p>
               <p class="text-lg font-bold text-slate-900 dark:text-white">{{ actualReturnAt.toLocaleString() }}</p>
             </div>

             <div class="pt-2">
                <div :class="['p-4 rounded-xl text-center border-2 border-dashed', actualReturnAt.getTime() > new Date(activeRental.end_at).getTime() ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200']">
                  <p :class="['text-2xl font-black', timeDiffColorClass]">
                    {{ timeDiffText }}
                  </p>
                </div>
             </div>
          </div>
        </UCard>
      </div>

      <div class="flex flex-col gap-4 items-center pt-8">
        <UButton
          label="Complete Return Process"
          size="xl"
          block
          color="primary"
          :loading="isSubmitting"
          class="cursor-pointer max-w-sm font-bold shadow-xl shadow-blue-500/20"
          @click="handleCompleteReturn"
        />
        <UButton
          label="Restart"
          variant="ghost"
          color="neutral"
          class="cursor-pointer"
          @click="currentStep = 1; activeRental = null"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce-vertical {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(240px); }
}
.animate-bounce-vertical {
  animation: bounce-vertical 2.5s infinite ease-in-out;
}
</style>
