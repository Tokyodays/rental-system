<script setup lang="ts">
import {
  type Customer,
  type CustomerRow,
  type CustomerTransaction,
  type NewCustomerForm,
  type CustomerUpdateForm,
  toCustomer,
  matchesCustomerSearch,
  matchesCustomerStatusFilter,
  toCustomerInsertPayload,
  toCustomerUpdatePayload
} from '~/utils/customer'

const search = ref('')
const client = useSupabaseClient()
const toast = useToast()
const { staff } = useStaff()
const { uploadPassportImage } = useCustomerPassport()

const customers = ref<Customer[]>([])
const isLoading = ref(true)
const fetchError = ref<string | null>(null)
const { ensureLoaded, customerStatuses, customerStatusId } = useStatusIds()
const statusFilter = ref('all')

const rentingStatusId = computed(() => customerStatusId('Renting'))

const statusOptions = computed(() => [
  { label: 'Active', value: customerStatusId('Active') || '' },
  { label: 'Unactive', value: customerStatusId('Unactive') || '' }
])

const filterStatuses = computed(() => [
  { name: 'All Statuses', id: 'all' },
  ...customerStatuses.value
])

// Add Customer Modal State
const isAddModalOpen = ref(false)
const isSubmitting = ref(false)
const addStep = ref(1) // 1: Info, 2: Camera
const newCustomer = reactive<NewCustomerForm>({
  full_name: '',
  email: '',
  phone: '',
  passport_number: ''
})

// Update Customer Modal State
const isUpdateModalOpen = ref(false)
const customerToUpdate = reactive<CustomerUpdateForm>({
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
const customerTransactions = ref<CustomerTransaction[]>([])
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

function handleSelectCustomer(customer: Customer) {
  selectedCustomerForDetail.value = customer
  fetchCustomerTransactions(customer.id)
}

function closeDetailPane() {
  selectedCustomerForDetail.value = null
}

// Camera related
const capturedPhoto = ref<string | null>(null) // DataURL for preview
const capturedBlob = ref<Blob | null>(null) // Blob for upload
const isCameraOpen = ref(false)

function resetPhoto() {
  if (capturedPhoto.value) URL.revokeObjectURL(capturedPhoto.value)
  capturedPhoto.value = null
  capturedBlob.value = null
}

function handleCapture(blob: Blob) {
  if (capturedPhoto.value) URL.revokeObjectURL(capturedPhoto.value)
  capturedBlob.value = blob
  capturedPhoto.value = URL.createObjectURL(blob)
  isCameraOpen.value = false
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
    
    customers.value = data?.map((row: CustomerRow) => toCustomer(row)) || []
  } catch (e: any) {
    console.error('Error fetching customers:', e)
    fetchError.value = e.message || 'Unknown error'
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  isAddModalOpen.value = true
  addStep.value = 1
}

function resetAddCustomerForm() {
  newCustomer.full_name = ''
  newCustomer.email = ''
  newCustomer.phone = ''
  newCustomer.passport_number = ''
  capturedBlob.value = null
  capturedPhoto.value = null
  addStep.value = 1
}

async function createCustomer(storeId: string) {
  // 1. Generate ID beforehand (Client-side UUID)
  const customerId = crypto.randomUUID()
  let passportUrl = ''

  // 2. Upload photo IF captured BEFORE inserting record
  if (capturedBlob.value) {
    passportUrl = await uploadPassportImage(customerId, capturedBlob.value)
  }

  // 3. Get Status ID (Active)
  await ensureLoaded()
  const statusId = customerStatusId('Active') || null

  // 4. Perform SINGLE INSERT with all information including passport_url
  const { error: insertError } = await client
    .from('customers')
    .insert(toCustomerInsertPayload({
      id: customerId,
      form: newCustomer,
      passportUrl,
      statusId,
      storeId
    }) as any)
  
  if (insertError) throw insertError
}

async function handleAddCustomer() {
  isSubmitting.value = true
  try {
    const storeId = staff.value?.store_id
    if (!storeId) throw new Error('Store ID not found.')

    await createCustomer(storeId)

    // Success - UI Updates
    isAddModalOpen.value = false
    resetAddCustomerForm()

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

function openDeleteModal(customer: Customer) {
  customerToDelete.value = customer
  isDeleteModalOpen.value = true
}

async function deleteCustomer(customerId: string) {
  const { error } = await client
    .from('customers')
    .delete()
    .eq('id', customerId)
  
  if (error) throw error
}

async function handleDeleteCustomer() {
  if (!customerToDelete.value) return
  
  isDeleting.value = true
  try {
    await deleteCustomer(customerToDelete.value.id)

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

async function updateCustomer() {
  let passportUrl = ''

  // 1. Upload photo if captured (Overwrite)
  if (capturedBlob.value) {
    passportUrl = await uploadPassportImage(customerToUpdate.id, capturedBlob.value)
  }

  // 2. Update database
  const { error } = await client
    .from('customers')
    .update(toCustomerUpdatePayload(customerToUpdate, passportUrl) as any)
    .eq('id', customerToUpdate.id)
  
  if (error) throw error
}

async function handleUpdateCustomer() {
  isSubmitting.value = true
  try {
    await updateCustomer()

    isUpdateModalOpen.value = false
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
  ensureLoaded()
})

const filteredCustomers = computed(() => {
  const keyword = search.value.toLowerCase()
  const filter = statusFilter.value

  return customers.value.filter(c =>
    matchesCustomerSearch(c, keyword) && matchesCustomerStatusFilter(c, filter)
  )
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
            @click="openAddModal"
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
                @click="handleSelectCustomer(c)"
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
                      @click.stop="openDeleteModal(c)"
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
    <CustomersDetailPane
      v-if="selectedCustomerForDetail"
      :customer="selectedCustomerForDetail"
      :transactions="customerTransactions"
      :is-loading-transactions="isLoadingTransactions"
      @close="closeDetailPane"
      @edit="openUpdateModal"
      @delete="openDeleteModal"
    />

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
            <UButton label="Next: Passport Photo" variant="subtle" color="neutral" class="cursor-pointer" @click="addStep = 2" />
            <UButton label="Register Customer" color="primary" class="cursor-pointer font-bold" :loading="isSubmitting" @click="handleAddCustomer" />
          </div>
        </div>

        <!-- Step 2: Camera Capture -->
        <div v-else class="space-y-6">
          <!-- Captured Photo Preview -->
          <div v-if="capturedPhoto" class="relative aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-inner">
            <img :src="capturedPhoto" class="w-full h-full object-cover" />
          </div>
          <div v-else class="flex flex-col items-center gap-4 py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <UIcon name="i-lucide-camera" class="size-12 text-slate-300" />
            <p class="text-sm text-slate-500 text-center px-6">Take a photo of the passport identification page.</p>
            <UButton
              label="Open Camera"
              icon="i-lucide-camera"
              color="primary"
              size="xl"
              class="cursor-pointer font-bold"
              @click="isCameraOpen = true"
            />
          </div>

          <div class="flex flex-col gap-3">
             <div v-if="capturedPhoto" class="grid grid-cols-2 gap-3">
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
               v-else
               label="Skip and Register"
               variant="subtle"
               color="neutral"
               size="xl"
               block
               class="cursor-pointer"
               :loading="isSubmitting"
               @click="handleAddCustomer"
             />

             <UButton
               label="Back to Info"
               variant="ghost"
               color="neutral"
               size="sm"
               class="cursor-pointer self-center"
               @click="addStep = 1"
             />
          </div>
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
                  :label="capturedPhoto ? 'Change Photo' : 'Update Photo'"
                  icon="i-lucide-camera"
                  variant="subtle"
                  size="xs"
                  class="cursor-pointer"
                  @click="isCameraOpen = true"
                />
             </div>

             <div v-if="capturedPhoto" class="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg">
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
            <UButton label="Cancel" variant="ghost" color="neutral" class="cursor-pointer" @click="isUpdateModalOpen = false" />
            <UButton label="Update Customer" type="submit" color="primary" class="cursor-pointer font-bold" :loading="isSubmitting" />
          </div>
        </UForm>
      </template>
    </UModal>

    <CameraCapture
      v-if="isCameraOpen"
      @capture="handleCapture"
      @close="isCameraOpen = false"
    />
  </div>
</template>
