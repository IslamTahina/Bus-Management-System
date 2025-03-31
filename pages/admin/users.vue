<template>
  <div class="container mx-auto px-4 py-8">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Manage Users</h1>
        <UButton
          icon="i-lucide-refresh-cw"
          @click="fetchUsers"
          :loading="isLoading"
        >
          Refresh
        </UButton>
      </div>

      <UCard>
        <div v-if="users.length === 0 && !isLoading" class="text-center py-4 text-gray-500">
          No users found
        </div>
        <div v-else>
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left">Name</th>
                <th class="px-4 py-3 text-left">Role</th>
                <th class="px-4 py-3 text-left">Balance</th>
                <th class="px-4 py-3 text-left">Joined</th>
                <th class="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="px-4 py-3">{{ user.name }}</td>
                <td class="px-4 py-3">
                  <UBadge :color="getRoleColor(user.role)">
                    {{ user.role }}
                  </UBadge>
                </td>
                <td class="px-4 py-3">{{ formatBalance(user.balance) }}</td>
                <td class="px-4 py-3">{{ formatDate(user.created_at) }}</td>
                <td class="px-4 py-3">
                  <UButton
                    color="red"
                    variant="ghost"
                    icon="i-lucide-trash"
                    @click="confirmDelete(user)"
                  />
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
          <h3 class="text-lg font-medium">Delete User</h3>
        </template>
        <p>Are you sure you want to delete this user? This action cannot be undone.</p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="ghost"
              @click="showDeleteModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="red"
              @click="deleteUser"
              :loading="isDeleting"
            >
              Delete
            </UButton>
          </div>
        </template>
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
const selectedUser = ref<Database['public']['Tables']['users']['Row'] | null>(null)

const users = ref<Database['public']['Tables']['users']['Row'][]>([])

const getRoleColor = (role: Database['public']['Enums']['user_role']) => {
  switch (role) {
    case 'admin':
      return 'red'
    case 'driver':
      return 'blue'
    case 'passenger':
      return 'green'
    default:
      return 'gray'
  }
}

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

const fetchUsers = async () => {
  try {
    isLoading.value = true
    console.log('Fetching users...')
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Fetched users:', data)
    users.value = data || []
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
}

const confirmDelete = (user: Database['public']['Tables']['users']['Row']) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const deleteUser = async () => {
  if (!selectedUser.value) return

  try {
    isDeleting.value = true
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', selectedUser.value.id)

    if (error) throw error

    // Remove user from local state
    users.value = users.value.filter(user => user.id !== selectedUser.value?.id)
    showDeleteModal.value = false
    selectedUser.value = null
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  console.log('Component mounted, fetching users...')
  fetchUsers()
})
</script> 