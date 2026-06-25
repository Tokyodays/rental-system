<script setup lang="ts">
const search = ref('')
const client = useSupabaseClient()
const toast = useToast()
const { staff } = useStaff()


interface Customer {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  passport_number?: string | null
  passport_url?: string | null
  customer_statuses: {
    name: string
    color: string
  }
  status_id?: string
  created_at: string
}

const customers = ref<Customer[]>([])
const isLoading = ref(true)
const fetchError = ref<string | null>(null)
const statuses = ref<{ id: string, name: string }[]>([])
const statusFilter = ref('all')

const activeStatusId = computed(() => statuses.value.find(s => s.name === 'Active')?.id)
const unactiveStatusId = computed(() => statuses.value.find(s => s.name === 'Unactive')?.id)
const rentingStatusId = computed(() => statuses.value.find(s => s.name === 'Renting')?.id)

const statusOptions = computed(() => [
  { label: 'Active', value: activeStatusId.value || '' },
  { label: 'Unactive', value: unactiveStatusId.value || '' }
])

const filterStatuses = computed(() => [
  { name: 'All Statuses', id: 'all' },
  ...statuses.value
])

// Add Customer Modal State
const isAddModalOpen = ref(false)
const isSubmitting = ref(false)
const addStep = ref(1) // 1: Info, 2: Camera
const newCustomer = reactive({
  full_name: '',
  email: '',
  phone: '',
  passport_number: ''
})

// Update Customer Modal State
const isUpdateModalOpen = ref(false)
const customerToUpdate = reactive({
  id: '',
  full_name: '',
  email: '',
  phone: '',
  passport_number: '',
  status_id: ''
})

// Delete Customer Modal State
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const customerToDelete = ref<Customer | null>(null)

// Detail Pane State
const selectedCustomerForDetail = ref<Customer | null>(null)
const customerTransactions = ref<any[]>([])
const isLoadingTransactions = ref(false)

async function fetchCustomerTransactions(customerId: string) {
  isLoadingTransactions.value = true
  try {
    const { data, error } = await client
      .from('transactions')
      .select('*, vehicles(name, code, vehicle_categories(name, icon))')
      .eq('customer_id', customerId)
      .order('start_at', { ascending: false })
    
    if (!error) {
      customerTransactions.value = data || []
    }
  } catch (e) {
    console.error('Error fetching transactions:', e)
  } finally {
    isLoadingTransactions.value = false
  }
}

function selectCustomer(customer: Customer) {
  selectedCustomerForDetail.value = customer
  fetchCustomerTransactions(customer.id)
}

function getPassportPublicUrl(path: string | null | undefined) {
  if (!path) return null
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) return path
  
  const { data } = client.storage.from('customer-passports').getPublicUrl(path)
  return data.publicUrl
}

const selectedFile = ref<File | null>(0 as any) // Dummy cast to avoid selection error
const fileInput = ref<HTMLInputElement | null>(null)

// Camera related
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const cameraStream = ref<MediaStream | null>(null)
const capturedPhoto = ref<string | null>(null) // DataURL for preview
const capturedBlob = ref<Blob | null>(null) // Blob for upload
const isCameraLoading = ref(false)
const isCapturing = ref(false)

async function startCamera() {
  isCameraLoading.value = true
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' }, // 手元のパスポートを撮るため背面カメラ優先
      audio: false 
    })
    cameraStream.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }
  } catch (err) {
    console.error('Camera error:', err)
    toast.add({ title: 'Camera Error', description: 'Could not access camera.', color: 'error' })
  } finally {
    isCameraLoading.value = false
  }
}

function stopCamera() {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop())
    cameraStream.value = null
  }
}

function takePhoto() {
  if (videoRef.value && canvasRef.value) {
    const video = videoRef.value
    const canvas = canvasRef.value
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      capturedPhoto.value = canvas.toDataURL('image/webp', 0.8)
      canvas.toBlob((blob) => {
        capturedBlob.value = blob
      }, 'image/webp', 0.8)
    }
  }
}

function resetPhoto() {
  capturedPhoto.value = null
  capturedBlob.value = null
}

function handleFileChange(event: any) {
  const file = event.target.files?.[0]
  if (file) {
    // If user uploaded a file manually, we don't force webp conversion here 
    // unless you want to re-process it through canvas.
    // For now, just keep the original blob for manual uploads.
    capturedBlob.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      capturedPhoto.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function fetchCustomers() {
  isLoading.value = true
  fetchError.value = null
  try {
    const { data, error } = await client
      .from('customers')
      .select('*, customer_statuses(name, color)')
      .order('created_at', { ascending: false })
    
    if (error) {
      fetchError.value = error.message
      throw error
    }
    
    // Normalize column names (handle potential legacy name passport_image_url)
    customers.value = data?.map((c: any) => ({
      ...c,
      passport_url: c.passport_url || c.passport_image_url || null
    })) || []
  } catch (e: any) {
    console.error('Error fetching customers:', e)
    fetchError.value = e.message || 'Unknown error'
  } finally {
    isLoading.value = false
  }
}

async function fetchStatuses() {
  const { data, error } = await client
    .from('customer_statuses')
    .select('id, name')
  if (!error && data) {
    statuses.value = data
  }
}

async function handleAddCustomer() {
  isSubmitting.value = true
  try {
    const storeId = staff.value?.store_id
    if (!storeId) throw new Error('Store ID not found.')

    // 1. Generate ID beforehand (Client-side UUID)
    const customerId = crypto.randomUUID()
    let passportUrl = ''

    // 2. Upload photo IF captured BEFORE inserting record
    if (capturedBlob.value) {
      const fileName = `${customerId}-passport.webp`
      const filePath = `passports/${fileName}`

      const { error: uploadError } = await client
        .storage
        .from('customer-passports')
        .upload(filePath, capturedBlob.value, {
          upsert: true,
          contentType: 'image/jpeg'
        })
      
      if (uploadError) throw uploadError
      passportUrl = filePath
    }

    // 3. Get Status ID (Active)
    const { data: activeStatus } = await client
      .from('customer_statuses')
      .select('id')
      .eq('name', 'Active')
      .single() as any
    const statusId = activeStatus?.id || null

    // 4. Perform SINGLE INSERT with all information including passport_url
    const { error: insertError } = await client
      .from('customers')
      .insert({
        id: customerId, // Explicitly provide the generated ID
        full_name: newCustomer.full_name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        passport_number: newCustomer.passport_number,
        passport_url: passportUrl,
        status_id: statusId,
        store_id: storeId
      } as any)
    
    if (insertError) throw insertError

    // Success - UI Updates
    isAddModalOpen.value = false
    newCustomer.full_name = ''
    newCustomer.email = ''
    newCustomer.phone = ''
    newCustomer.passport_number = ''
    capturedBlob.value = null
    capturedPhoto.value = null
    addStep.value = 1
    stopCamera()
    
    await fetchCustomers()
    toast.add({
      title: 'Success',
      description: 'Customer registered with passport successfully.',
      color: 'success'
    })
  } catch (e: any) {
    console.error('Integration failed:', e)
    toast.add({
      title: 'Registration Failed',
      description: e.message || 'Check your input or network connection.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(customer: Customer) {
  customerToDelete.value = customer
  isDeleteModalOpen.value = true
}

async function handleDeleteCustomer() {
  if (!customerToDelete.value) return
  
  isDeleting.value = true
  try {
    const { error } = await client
      .from('customers')
      .delete()
      .eq('id', customerToDelete.value.id)
    
    if (error) throw error

    isDeleteModalOpen.value = false
    customerToDelete.value = null
    
    await fetchCustomers()
    toast.add({
      title: 'Customer Deleted',
      description: 'The customer has been removed successfully.',
      color: 'success'
    })
  } catch (e: any) {
    console.error('Delete failed:', e)
    toast.add({
      title: 'Delete Failed',
      description: e.message || 'Failed to delete customer.',
      color: 'error'
    })
  } finally {
    isDeleting.value = false
  }
}

function openUpdateModal(customer: Customer) {
  customerToUpdate.id = customer.id
  customerToUpdate.full_name = customer.full_name
  customerToUpdate.email = customer.email || ''
  customerToUpdate.phone = customer.phone || ''
  customerToUpdate.passport_number = customer.passport_number || ''
  customerToUpdate.status_id = customer.status_id || ''
  
  resetPhoto()
  isUpdateModalOpen.value = true
}

async function handleUpdateCustomer() {
  isSubmitting.value = true
  try {
    let passportUrl = ''

    // 1. Upload photo if captured (Overwrite)
    if (capturedBlob.value) {
      const fileName = `${customerToUpdate.id}-passport.webp`
      const filePath = `passports/${fileName}`

      const { error: uploadError } = await client
        .storage
        .from('customer-passports')
        .upload(filePath, capturedBlob.value, {
          upsert: true,
          contentType: 'image/jpeg'
        })
      
      if (uploadError) throw uploadError
      passportUrl = filePath
    }

    // 2. Update database
    const updateData: any = {
      full_name: customerToUpdate.full_name,
      email: customerToUpdate.email,
      phone: customerToUpdate.phone,
      passport_number: customerToUpdate.passport_number,
      status_id: customerToUpdate.status_id
    }

    if (passportUrl) {
      updateData.passport_url = passportUrl
    }

    const { error } = await client
      .from('customers')
      .update(updateData)
      .eq('id', customerToUpdate.id)
    
    if (error) throw error

    isUpdateModalOpen.value = false
    stopCamera()
    resetPhoto()
    await fetchCustomers()
    toast.add({
      title: 'Customer Updated',
      description: 'The customer information has been updated successfully.',
      color: 'success'
    })
  } catch (e: any) {
    console.error('Update failed:', e)
    toast.add({
      title: 'Update Failed',
      description: e.message || 'Failed to update customer.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchCustomers()
  fetchStatuses()
})

const filteredCustomers = computed(() => {
  const s = search.value.toLowerCase()
  const f = statusFilter.value
  
  return customers.value.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(s) || 
                         (c.email && c.email.toLowerCase().includes(s))
    
    const matchesFilter = f === 'all' || c.status_id === f
    
    return matchesSearch && matchesFilter
  })
})
</script>

<template>
  <div class="flex flex-1 overflow-hidden -m-6 h-[calc(100vh-64px)]">
    <!-- Main Content: Customer List -->
    <main class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden min-w-[600px]">
      <!-- Header Area: Search & Filters -->
      <div class="flex flex-col gap-4 p-6 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-4 mt-2">
          <div class="flex-1 relative">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Search customers..."
              size="md"
              class="w-full"
            />
          </div>
          <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
            <span class="text-[10px] font-bold text-slate-400 px-2 uppercase hidden sm:inline">Status</span>
            <div class="flex items-center gap-1">
              <button
                v-for="s in filterStatuses"
                :key="s.id"
                type="button"
                @click="statusFilter = s.id"
                :class="[
                  'px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap',
                  statusFilter === s.id 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                ]"
              >
                {{ s.name }}
              </button>
            </div>
          </div>
          <UButton
            label="Add New Customer"
            icon="i-lucide-user-plus"
            color="primary"
            size="md"
            class="cursor-pointer"
            @click="isAddModalOpen = true; addStep = 1"
          />
        </div>
      </div>

      <!-- Table Area -->
      <div class="flex-1 overflow-auto p-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-sm">
          <div v-if="isLoading" class="p-12 text-center text-slate-500">
            <UIcon name="i-lucide-loader-2" class="animate-spin size-8 mb-2 mx-auto" />
            <p>Loading customers...</p>
          </div>
          <div v-else-if="fetchError" class="p-12 text-center text-red-500">
            <UIcon name="i-lucide-alert-circle" class="size-8 mb-2 mx-auto" />
            <p>Error: {{ fetchError }}</p>
            <UButton label="Retry" variant="ghost" color="error" class="mt-4 cursor-pointer" @click="fetchCustomers" />
          </div>
          <table v-else class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Docs</th>
                <th class="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr 
                v-for="c in filteredCustomers" 
                :key="c.id" 
                @click="selectCustomer(c)"
                :class="[
                  'hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer',
                  selectedCustomerForDetail?.id === c.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <UAvatar :alt="c.full_name" size="sm" class="font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
                    <div class="ml-4 font-bold text-slate-900 dark:text-white text-sm">{{ c.full_name }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <div>{{ c.email }}</div>
                  <div class="text-xs">{{ c.phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <div class="flex gap-1 items-center">
                    <UIcon
                      :name="c.passport_url ? 'i-lucide-file-check' : 'i-lucide-file-warning'"
                      :class="c.passport_url ? 'text-green-500' : 'text-slate-300'"
                      class="size-5"
                    />
                    <span v-if="c.passport_number" class="text-[10px] font-mono text-slate-500">{{ c.passport_number }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <UBadge
                    v-if="c.customer_statuses"
                    :label="c.customer_statuses.name"
                    :color="c.customer_statuses.color as any"
                    variant="subtle"
                    class="rounded-full"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div class="flex items-center justify-end gap-1">
                    <UButton
                      icon="i-lucide-pencil"
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      class="cursor-pointer"
                      @click.stop="openUpdateModal(c)"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      variant="ghost"
                      color="error"
                      size="xs"
                      class="cursor-pointer"
                      @click.stop="confirmDelete(c)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Pagination Mock -->
          <div class="bg-white dark:bg-slate-900 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 sm:px-6 font-medium">
            <p class="text-sm text-slate-700 dark:text-slate-300">
              Showing <span class="font-bold">1</span> to <span class="font-bold">{{ filteredCustomers.length }}</span> of <span class="font-bold">{{ filteredCustomers.length }}</span> results
            </p>
            <div class="flex gap-2">
              <UButton icon="i-lucide-chevron-left" variant="outline" color="neutral" size="xs" disabled class="cursor-pointer" />
              <UButton icon="i-lucide-chevron-right" variant="outline" color="neutral" size="xs" disabled class="cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Details Sidebar (Right Pane) -->
    <aside
      v-if="selectedCustomerForDetail"
      class="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto hidden lg:flex"
    >
      <div class="p-6 flex flex-col h-full space-y-6">
        <div class="flex items-start justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Customer Profile</h3>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="selectedCustomerForDetail = null"
          />
        </div>

        <!-- Passport Image Display -->
        <div class="flex flex-col items-center">
          <div class="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 mb-4 border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-sm">
            <template v-if="selectedCustomerForDetail.passport_url">
              <img 
                :src="getPassportPublicUrl(selectedCustomerForDetail.passport_url)" 
                class="w-full h-full object-cover" 
                @error="(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Load+Error'"
              />
            </template>
            <div v-else class="flex flex-col items-center gap-2">
               <UIcon name="i-lucide-user" class="text-6xl text-slate-300" />
               <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Passport Photo</p>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white text-center">{{ selectedCustomerForDetail.full_name }}</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-4">{{ selectedCustomerForDetail.email }}</p>
          
          <UBadge
            v-if="selectedCustomerForDetail.customer_statuses"
            :label="selectedCustomerForDetail.customer_statuses.name"
            :color="selectedCustomerForDetail.customer_statuses.color as any"
            variant="subtle"
            class="rounded-full px-4"
          />
        </div>

        <!-- Actions -->
        <div class="grid grid-cols-2 gap-3">
          <UButton
            label="Edit Info"
            icon="i-lucide-pencil"
            color="neutral"
            variant="subtle"
            block
            class="cursor-pointer font-bold"
            @click="openUpdateModal(selectedCustomerForDetail)"
          />
          <UButton
            label="Delete"
            icon="i-lucide-trash-2"
            color="error"
            variant="subtle"
            block
            class="cursor-pointer font-bold"
            @click="confirmDelete(selectedCustomerForDetail)"
          />
        </div>

        <div class="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-y-4 gap-x-2">
            <div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Phone Number</p>
              <p class="text-sm text-slate-900 dark:text-white font-medium">{{ selectedCustomerForDetail.phone || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Passport Number</p>
              <p class="text-sm font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">{{ selectedCustomerForDetail.passport_number || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">Registered At</p>
              <p class="text-sm text-slate-900 dark:text-white font-medium">{{ new Date(selectedCustomerForDetail.created_at).toLocaleDateString() }}</p>
            </div>
            <div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mb-1">ID</p>
              <p class="text-xs font-mono text-slate-400 truncate">{{ selectedCustomerForDetail.id.split('-')[0] }}...</p>
            </div>
          </div>

          <!-- Rental History -->
          <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UIcon name="i-lucide-history" class="size-4" />
                Rental History
              </h4>
              <UBadge :label="`${customerTransactions.length}`" color="neutral" variant="subtle" size="xs" />
            </div>

            <div v-if="isLoadingTransactions" class="flex flex-col items-center py-4 space-y-2">
               <UIcon name="i-lucide-loader-2" class="size-5 animate-spin text-slate-400" />
               <p class="text-[10px] text-slate-500">Loading history...</p>
            </div>
            <div v-else-if="customerTransactions.length === 0" class="text-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
               <p class="text-xs text-slate-400">No rental records found.</p>
            </div>
            <div v-else class="space-y-3 max-h-[300px] overflow-y-auto pr-1">
               <div v-for="t in customerTransactions" :key="t.id" class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition-colors">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                       <UIcon :name="t.vehicles?.vehicle_categories?.icon || 'i-lucide-package'" class="size-3.5 text-blue-500" />
                       <p class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{{ t.vehicles?.name }}</p>
                    </div>
                    <span :class="['text-[10px] px-1.5 py-0.5 rounded-full font-bold', t.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300']">
                      {{ t.status }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-[10px]">
                    <p class="text-slate-500">{{ new Date(t.start_at).toLocaleDateString() }}</p>
                    <p class="font-bold text-blue-600 dark:text-blue-400">{{ t.price }}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Modals (Add, Delete, Update) -->
    <UModal v-model:open="isAddModalOpen" :title="addStep === 1 ? 'Add New Customer' : 'Take Passport Photo'" :description="addStep === 1 ? 'Register a new customer to the system.' : 'Scan or take a photo of the passport identification page.'">
      <template #body>
        <!-- Step 1: Basic Info -->
        <div v-if="addStep === 1" class="space-y-4">
          <UFormField label="Full Name" name="full_name" required>
            <UInput v-model="newCustomer.full_name" placeholder="e.g. John Doe" />
          </UFormField>

          <UFormField label="Email Address" name="email">
            <UInput v-model="newCustomer.email" type="email" placeholder="john@example.com" />
          </UFormField>

          <UFormField label="Phone Number" name="phone" required>
            <UInput v-model="newCustomer.phone" placeholder="+81-XXX-XXXX-XXXX" />
          </UFormField>

          <UFormField label="Passport Number" name="passport_number">
            <UInput v-model="newCustomer.passport_number" placeholder="e.g. TK1234567" />
          </UFormField>

          <div class="flex justify-end gap-3 mt-6 flex-wrap">
            <UButton label="Cancel" variant="ghost" color="neutral" class="cursor-pointer" @click="isAddModalOpen = false" />
            <UButton label="Next: Passport Photo" variant="subtle" color="neutral" class="cursor-pointer" @click="addStep = 2; startCamera()" />
            <UButton label="Register Customer" color="primary" class="cursor-pointer font-bold" :loading="isSubmitting" @click="handleAddCustomer" />
          </div>
        </div>

        <!-- Step 2: Camera Capture -->
        <div v-else class="space-y-6">
          <!-- Camera Preview / Captured Photo -->
          <div class="relative aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center group">
            <video v-show="!capturedPhoto" ref="videoRef" autoplay playsinline class="w-full h-full object-cover shadow-xl"></video>
            <img v-if="capturedPhoto" :src="capturedPhoto" class="w-full h-full object-cover" />
            
            <div v-if="isCameraLoading" class="absolute inset-0 flex items-center justify-center bg-slate-900/50">
               <UIcon name="i-lucide-loader-2" class="size-10 animate-spin text-white" />
            </div>

            <!-- Focus box overlay -->
            <div v-if="!capturedPhoto" class="absolute inset-0 border-[40px] border-black/40 pointer-events-none flex items-center justify-center">
              <div class="w-full h-full border-2 border-white/50 border-dashed rounded-lg flex items-center justify-center">
                 <p class="text-white/70 text-[10px] font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded">Align Passport Here</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
             <div v-if="!capturedPhoto" class="grid grid-cols-2 gap-3">
               <UButton
                 label="Capture Photo"
                 icon="i-lucide-camera"
                 color="primary"
                 size="xl"
                 block
                 class="cursor-pointer font-bold"
                 @click="takePhoto"
               />
               <UButton
                 label="Skip and Register"
                 variant="subtle"
                 color="neutral"
                 size="xl"
                 block
                 class="cursor-pointer"
                 :loading="isSubmitting"
                 @click="handleAddCustomer"
               />
             </div>
             <div v-else class="grid grid-cols-2 gap-3">
               <UButton
                 label="Retake"
                 variant="outline"
                 color="neutral"
                 icon="i-lucide-refresh-cw"
                 size="xl"
                 block
                 class="cursor-pointer"
                 @click="resetPhoto"
               />
               <UButton
                 label="Register Customer"
                 color="primary"
                 size="xl"
                 block
                 class="cursor-pointer font-bold shadow-lg shadow-blue-500/20"
                 :loading="isSubmitting"
                 @click="handleAddCustomer"
               />
             </div>
             
             <UButton
               label="Back to Info"
               variant="ghost"
               color="neutral"
               size="sm"
               class="cursor-pointer self-center"
               @click="addStep = 1; stopCamera()"
             />
          </div>

          <!-- Hidden canvas for processing -->
          <canvas ref="canvasRef" class="hidden"></canvas>
        </div>
      </template>
    </UModal>
    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteModalOpen" title="Delete Customer" description="Are you sure you want to delete this customer? This action cannot be undone.">
      <template #body>
        <div v-if="customerToDelete" class="space-y-4">
          <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
            <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">Customer to be deleted</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white mt-1">{{ customerToDelete.full_name }}</p>
            <p class="text-sm text-slate-500">{{ customerToDelete.email }}</p>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" variant="ghost" color="neutral" class="cursor-pointer" @click="isDeleteModalOpen = false" />
            <UButton label="Delete" color="error" class="cursor-pointer" :loading="isDeleting" @click="handleDeleteCustomer" />
          </div>
        </div>
      </template>
    </UModal>

    <!-- Update Customer Modal -->
    <UModal v-model:open="isUpdateModalOpen" title="Update Customer" description="Update the information for this customer.">
      <template #body>
        <UForm :state="customerToUpdate" class="space-y-4" @submit="handleUpdateCustomer">
          <UFormField label="Full Name" name="full_name" required>
            <UInput v-model="customerToUpdate.full_name" placeholder="e.g. John Doe" />
          </UFormField>

          <UFormField label="Email Address" name="email">
            <UInput v-model="customerToUpdate.email" type="email" placeholder="john@example.com" />
          </UFormField>

          <UFormField label="Phone Number" name="phone" required>
            <UInput v-model="customerToUpdate.phone" placeholder="+81-XXX-XXXX-XXXX" />
          </UFormField>

          <UFormField label="Passport Number" name="passport_number">
            <UInput v-model="customerToUpdate.passport_number" placeholder="e.g. TK1234567" />
          </UFormField>

          <!-- Passport Image Management (Update) -->
          <div class="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
             <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-slate-900 dark:text-white">Passport Photo</span>
                <UButton
                  v-if="!isCapturing"
                  :label="capturedPhoto ? 'Change Photo' : 'Update Photo'"
                  icon="i-lucide-camera"
                  variant="subtle"
                  size="xs"
                  class="cursor-pointer"
                  @click="isCapturing = true; startCamera()"
                />
             </div>

             <!-- Photo Review / Capture Area -->
             <div v-if="isCapturing" class="space-y-3">
                <div class="relative aspect-square bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <video v-if="!capturedPhoto" ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
                  <img v-else :src="capturedPhoto" class="w-full h-full object-cover" />
                  <div v-if="isCameraLoading" class="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                    <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-white" />
                  </div>
                </div>
                <div class="flex gap-2">
                   <template v-if="!capturedPhoto">
                     <UButton label="Capture" icon="i-lucide-camera" block class="flex-1 cursor-pointer" @click="takePhoto" />
                     <UButton label="Cancel" variant="ghost" class="cursor-pointer" @click="isCapturing = false; stopCamera()" />
                   </template>
                   <template v-else>
                     <UButton label="Retake" variant="outline" block class="flex-1 cursor-pointer" @click="resetPhoto" />
                     <UButton label="Done" variant="subtle" color="primary" class="cursor-pointer" @click="isCapturing = false; stopCamera()" />
                   </template>
                </div>
             </div>
             <div v-else-if="capturedPhoto" class="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg">
                <div class="size-12 rounded bg-white dark:bg-slate-800 overflow-hidden border border-green-200 dark:border-green-800 shrink-0">
                  <img :src="capturedPhoto" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-tight">New photo selected</p>
                  <p class="text-[10px] text-green-600/70 truncate">Will be saved upon update</p>
                </div>
                <UButton icon="i-lucide-x" variant="ghost" color="error" size="xs" class="cursor-pointer" @click="resetPhoto" />
             </div>
          </div>

          <div v-if="customerToUpdate.status_id === rentingStatusId" class="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 text-sm border border-blue-100 dark:border-blue-900/50">
            <UIcon name="i-lucide-info" class="size-5" />
            <span class="font-medium">Status cannot be changed while renting.</span>
          </div>
          <UFormField v-else label="Status" name="status" description="Select the customer status.">
            <URadioGroup
              v-model="customerToUpdate.status_id"
              :items="statusOptions"
              class="mt-1"
            />
          </UFormField>

          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" variant="ghost" color="neutral" class="cursor-pointer" @click="isUpdateModalOpen = false; stopCamera()" />
            <UButton label="Update Customer" type="submit" color="primary" class="cursor-pointer font-bold" :loading="isSubmitting" />
          </div>
        </UForm>
      </template>
    </UModal>
    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>
