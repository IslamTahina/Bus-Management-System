<script setup lang="ts">
import { useSupabaseUser, useSupabaseClient } from '#imports'
import type { Database } from '@/types/supabase'

const supabase = useSupabaseClient<Database>()
const authUser = useSupabaseUser()
const router = useRouter()

const user = ref<Database['public']['Tables']['users']['Row'] | null>(null)
type Trip = Database['public']['Tables']['trips']['Row'] & {
  amount?: number
  status?: string
}

const trips = ref<Trip[]>([])
const isLoading = ref(false)
const isLoadingTrips = ref(false)
const isUpdating = ref(false)
const isChangingPassword = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)

const form = reactive({
  name: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const userEmail = computed(() => authUser.value?.email || 'N/A')

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Fetch user profile
const fetchProfile = async () => {
  if (!authUser.value?.id) return

  try {
    isLoading.value = true
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.value.id)
      .single()

    if (error) throw error
    if (data) {
      user.value = data
      form.name = data.name
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    isLoading.value = false
  }
}

// Fetch user trips
const fetchTrips = async () => {
  if (!authUser.value?.id) return

  try {
    isLoadingTrips.value = true
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('passenger_id', authUser.value.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error
    trips.value = data || []
  } catch (error) {
    console.error('Error fetching trips:', error)
  } finally {
    isLoadingTrips.value = false
  }
}

// Update profile
const updateProfile = async () => {
  if (!authUser.value?.id) return

  try {
    isUpdating.value = true
    const { error } = await supabase
      .from('users')
      .update({
        name: form.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', authUser.value.id)

    if (error) throw error

    // Update local user data
    if (user.value) {
      user.value.name = form.name
    }

    useToast().add({
      title: 'Success',
      description: 'Profile updated successfully',
      color: 'success'
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to update profile',
      color: 'error'
    })
  } finally {
    isUpdating.value = false
  }
}

// Change password
const changePassword = async () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    useToast().add({
      title: 'Error',
      description: 'Please fill in all password fields',
      color: 'error'
    })
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    useToast().add({
      title: 'Error',
      description: 'New passwords do not match',
      color: 'error'
    })
    return
  }

  try {
    isChangingPassword.value = true
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    })

    if (error) throw error

    // Clear password form
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    useToast().add({
      title: 'Success',
      description: 'Password updated successfully',
      color: 'success'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to update password',
      color: 'error'
    })
  } finally {
    isChangingPassword.value = false
  }
}

// Delete account
const confirmDeleteAccount = () => {
  showDeleteModal.value = true
}

const deleteAccount = async () => {
  if (!authUser.value?.id) return

  try {
    isDeleting.value = true

    // Delete user record from users table
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', authUser.value.id)

    if (dbError) throw dbError

    // Sign out
    const { error: authError } = await supabase.auth.signOut()
    if (authError) throw authError

    // Redirect to login
    router.push('/login')
  } catch (error) {
    console.error('Error deleting account:', error)
    useToast().add({
      title: 'Error',
      description: 'Failed to delete account',
      color: 'error'
    })
  } finally {
    isDeleting.value = false
    showDeleteModal.value = false
  }
}

// Initialize
onMounted(() => {
  fetchProfile()
  fetchTrips()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Profile Header -->
      <UCard>
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-primary/10 rounded-full">
            <Icon name="i-lucide-user" class="w-8 h-8 text-primary" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ user?.name || 'Passenger' }}</h2>
            <p class="text-gray-500">Passenger Account</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Balance</p>
            <p class="text-xl font-semibold text-primary">
              {{ formatCurrency(user?.balance || 0) }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Profile Information -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Profile Information</h3>
        </template>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
            <UInput
              v-model="form.name"
              placeholder="Enter your name"
              class="mt-1"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <p class="mt-1 text-gray-500">{{ userEmail }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Role</label>
            <UBadge color="primary" class="mt-1">
              Passenger
            </UBadge>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Member Since</label>
            <p class="mt-1 text-gray-500">{{ formatDate(user?.created_at) }}</p>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              color="primary"
              :loading="isUpdating"
              @click="updateProfile"
            >
              Save Changes
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- Recent Trips -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Recent Trips</h3>
            <UButton
              color="primary"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              :loading="isLoadingTrips"
              @click="fetchTrips"
            >
              Refresh
            </UButton>
          </div>
        </template>
        
        <div v-if="trips.length" class="space-y-4">
          <div
            v-for="trip in trips"
            :key="trip.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div>
              <p class="font-medium">Trip #{{ trip.id }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(trip.created_at) }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium">{{ formatCurrency(trip.amount ?? 0) }}</p>
              <UBadge
                :color="trip.status === 'completed' ? 'success' : 'warning'"
              >
                {{ trip.status ?? 'pending' }}
              </UBadge>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          No trips found
        </div>
      </UCard>

      <!-- Change Password -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Change Password</h3>
        </template>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Current Password</label>
            <UInput
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="Enter current password"
              class="mt-1"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password"
              class="mt-1"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Confirm New Password</label>
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
              class="mt-1"
            />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              color="primary"
              :loading="isChangingPassword"
              @click="changePassword"
            >
              Update Password
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- Danger Zone -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium text-red-500">Danger Zone</h3>
        </template>
        <p class="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <UButton
          color="error"
          variant="soft"
          @click="confirmDeleteAccount"
        >
          Delete Account
        </UButton>
      </UCard>
    </div>

    <!-- Delete Account Modal -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">Delete Account</h3>
        </template>
        <p class="text-gray-500">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
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
              :loading="isDeleting"
              @click="deleteAccount"
            >
              Delete Account
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template> 