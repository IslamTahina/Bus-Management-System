<template>
  <div class="container mx-auto px-4 py-8">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Manage Drivers</h1>
        <UButton
          icon="i-lucide-refresh-cw"
          @click="fetchDrivers"
          :loading="isLoading"
        >
          Refresh
        </UButton>
      </div>

      <UCard>
        <div v-if="drivers.length === 0 && !isLoading" class="text-center py-4 text-gray-500">
          No drivers found
        </div>
        <div v-else>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left">Name</th>
                <th class="px-4 py-3 text-left">Status</th>
                <th class="px-4 py-3 text-left">Balance</th>
                <th class="px-4 py-3 text-left">Joined</th>
                <th class="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="driver in drivers" :key="driver.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-3">{{ driver.name }}</td>
                <td class="px-4 py-3">
                  <UBadge color="primary">
                    Driver
                  </UBadge>
                </td>
                <td class="px-4 py-3">{{ formatBalance(driver.balance) }}</td>
                <td class="px-4 py-3">{{ formatDate(driver.created_at) }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <UButton
                      color="primary"
                      variant="ghost"
                      icon="i-lucide-eye"
                      @click="viewDriverDetails(driver)"
                    />
                    <UButton
                      color="error"
                      variant="ghost"
                      icon="i-lucide-trash"
                      @click="confirmDelete(driver)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Delete Driver</h3>
        </template>
        <p>Are you sure you want to delete this driver? This action cannot be undone.</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showDeleteModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              @click="deleteDriver"
              :loading="isDeleting"
            >
              Delete
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Driver Details Modal -->
    <UModal v-model="showDetailsModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Driver Details</h3>
        </template>
        <div v-if="selectedDriver" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Name</p>
              <p class="font-medium">{{ selectedDriver.name }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Balance</p>
              <p class="font-medium">{{ formatBalance(selectedDriver.balance) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Joined</p>
              <p class="font-medium">{{ formatDate(selectedDriver.created_at) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Last Updated</p>
              <p class="font-medium">{{ formatDate(selectedDriver.updated_at) }}</p>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '@/types/supabase'

const supabase = useSupabaseClient<Database>()
const isLoading = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const showDetailsModal = ref(false)
const selectedDriver = ref<Database['public']['Tables']['users']['Row'] | null>(null)

const drivers = ref<Database['public']['Tables']['users']['Row'][]>([])

const formatBalance = (balance: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(balance)
}

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchDrivers = async () => {
  try {
    isLoading.value = true
    console.log('Fetching drivers...')
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'driver')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Fetched drivers:', data)
    drivers.value = data || []
  } catch (error) {
    console.error('Error fetching drivers:', error)
  } finally {
    isLoading.value = false
  }
}

const viewDriverDetails = (driver: Database['public']['Tables']['users']['Row']) => {
  selectedDriver.value = driver
  showDetailsModal.value = true
}

const confirmDelete = (driver: Database['public']['Tables']['users']['Row']) => {
  selectedDriver.value = driver
  showDeleteModal.value = true
}

const deleteDriver = async () => {
  if (!selectedDriver.value) return

  try {
    isDeleting.value = true
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', selectedDriver.value.id)

    if (error) throw error

    // Remove driver from local state
    drivers.value = drivers.value.filter(driver => driver.id !== selectedDriver.value?.id)
    showDeleteModal.value = false
    selectedDriver.value = null
  } catch (error) {
    console.error('Error deleting driver:', error)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  console.log('Component mounted, fetching drivers...')
  fetchDrivers()
})
</script> 