<script setup lang="ts">
const search = ref('')
const client = useSupabaseClient()
const toast = useToast()

interface Customer {
  id: string
  full_name: string
  email: string
  phone: string
  passport_url?: string
  status: string
  created_at: string
}

const customers = ref<Customer[]>([])
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

// Add Customer Modal State
const isAddModalOpen = ref(false)
const isSubmitting = ref(false)
const newCustomer = reactive({
  full_name: '',
  email: '',
  phone: ''
})

const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function handleFileChange(event: any) {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

async function fetchCustomers() {
  isLoading.value = true
  fetchError.value = null
  try {
    const { data, error } = await client
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      fetchError.value = error.message
      throw error
    }
    
    customers.value = data?.map((c: any) => ({
      ...c,
      status: 'Active'
    })) || []
  } catch (e: any) {
    console.error('Error fetching customers:', e)
    fetchError.value = e.message || 'Unknown error'
  } finally {
    isLoading.value = false
  }
}

async function handleAddCustomer() {
  isSubmitting.value = true
  try {
    let passportUrl = ''

    // 1. Upload passport if selected
    if (selectedFile.value) {
      const fileExt = selectedFile.value.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `passports/${fileName}`

      const { data: uploadData, error: uploadError } = await client
        .storage
        .from('customer-passports')
        .upload(filePath, selectedFile.value)
      
      if (uploadError) throw uploadError
      passportUrl = filePath // パスを保存
    }

    // 2. Insert customer data
    const { error } = await client
      .from('customers')
      .insert({
        full_name: newCustomer.full_name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        passport_url: passportUrl
      } as any)
    
    if (error) throw error

    isAddModalOpen.value = false
    // Reset form
    newCustomer.full_name = ''
    newCustomer.email = ''
    newCustomer.phone = ''
    selectedFile.value = null
    
    await fetchCustomers()
    toast.add({
      title: 'Success',
      description: 'Customer has been registered successfully.',
      color: 'success'
    })
  } catch (e: any) {
    console.error('Add failed:', e)
    toast.add({
      title: 'Error',
      description: e.message || 'Failed to add customer.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchCustomers()
})

const filteredCustomers = computed(() => {
  return customers.value.filter(c => 
    c.full_name.toLowerCase().includes(search.value.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>

<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="relative w-full sm:w-96">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search customers..."
          size="md"
          class="w-full"
        />
      </div>
      <UButton
        label="Add New Customer"
        icon="i-lucide-user-plus"
        color="primary"
        size="md"
        class="w-full sm:w-auto"
        @click="isAddModalOpen = true"
      />
    </div>

    <!-- Table Card -->
    <UCard
      class="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
      :ui="{ body: 'p-0' }"
    >
      <div class="overflow-x-auto min-h-[200px]">
        <div v-if="isLoading" class="p-12 text-center text-slate-500">
          <UIcon name="i-lucide-loader-2" class="animate-spin size-8 mb-2 mx-auto" />
          <p>Loading customers...</p>
        </div>
        <div v-else-if="fetchError" class="p-12 text-center text-red-500">
          <UIcon name="i-lucide-alert-circle" class="size-8 mb-2 mx-auto" />
          <p>Error: {{ fetchError }}</p>
          <UButton label="Retry" variant="ghost" color="error" class="mt-4" @click="fetchCustomers" />
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
            <tr v-for="c in filteredCustomers" :key="c.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
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
                <UIcon
                  :name="c.passport_url ? 'i-lucide-file-check' : 'i-lucide-file-warning'"
                  :class="c.passport_url ? 'text-green-500' : 'text-slate-300'"
                  class="size-5"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
                  :label="c.status"
                  :color="c.status === 'Active' ? 'success' : 'neutral'"
                  variant="subtle"
                  class="rounded-full"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <div class="flex items-center justify-end gap-2">
                  <UButton
                    icon="i-lucide-pencil"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                  />
                  <UButton
                    icon="i-lucide-trash-2"
                    variant="ghost"
                    color="error"
                    size="xs"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="filteredCustomers.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                No customers found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <template #footer>
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-500">
            Showing <span class="font-bold text-slate-900 dark:text-white">1</span> to <span class="font-bold text-slate-900 dark:text-white">{{ filteredCustomers.length }}</span> of <span class="font-bold text-slate-900 dark:text-white">{{ filteredCustomers.length }}</span> results
          </p>
          <div class="flex gap-2">
            <UButton icon="i-lucide-chevron-left" variant="outline" color="neutral" size="xs" disabled />
            <UButton icon="i-lucide-chevron-right" variant="outline" color="neutral" size="xs" disabled />
          </div>
        </div>
      </template>
    </UCard>

    <!-- Add Customer Modal -->
    <UModal v-model:open="isAddModalOpen" title="Add New Customer" description="Register a new customer to the system.">
      <template #body>
        <UForm :state="newCustomer" class="space-y-4" @submit="handleAddCustomer">
          <UFormField label="Full Name" name="full_name" required>
            <UInput v-model="newCustomer.full_name" placeholder="e.g. John Doe" />
          </UFormField>

          <UFormField label="Email Address" name="email">
            <UInput v-model="newCustomer.email" type="email" placeholder="john@example.com" />
          </UFormField>

          <UFormField label="Phone Number" name="phone">
            <UInput v-model="newCustomer.phone" placeholder="+81-XXX-XXXX-XXXX" />
          </UFormField>

          <UFormField label="Passport Image" name="passport">
            <div class="space-y-2">
              <UInput
                type="file"
                accept="image/*"
                @change="handleFileChange"
              />
              <p class="text-xs text-slate-500">
                Upload a clear photo of the passport identification page.
              </p>
            </div>
          </UFormField>

          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" variant="ghost" color="neutral" @click="isAddModalOpen = false" />
            <UButton label="Register Customer" type="submit" color="primary" :loading="isSubmitting" />
          </div>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
