<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Profile Header -->
      <UCard>
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-primary/10 rounded-full">
            <Icon :name="roleIcon" class="w-8 h-8 text-primary" />
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ user?.name || roleName }}</h2>
            <p class="text-gray-500">{{ roleName }} Account</p>
          </div>
          <div v-if="showBalance" class="text-right">
            <p class="text-sm text-gray-500">{{ balanceLabel }}</p>
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
            <UBadge :color="roleColor" class="mt-1">
              {{ roleName }}
            </UBadge>
          </div>

          <div v-if="isDriver">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
            <UBadge :color="user?.role === 'driver' ? 'success' : 'warning'" class="mt-1">
              {{ user?.role === 'driver' ? 'Active' : 'Pending' }}
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

      <!-- Vehicle Information (Driver Only) -->
      <UCard v-if="isDriver">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Vehicle Information</h3>
            <UButton
              v-if="!vehicle"
              color="primary"
              variant="ghost"
              icon="i-lucide-plus"
              @click="showVehicleModal = true"
            >
              Add Vehicle
            </UButton>
          </div>
        </template>
        
        <div v-if="vehicle" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Vehicle Number</label>
              <p class="mt-1">{{ vehicle.number }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">License Plate</label>
              <p class="mt-1">{{ vehicle.license_plate }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Model</label>
              <p class="mt-1">{{ vehicle.model }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Capacity</label>
              <p class="mt-1">{{ vehicle.capacity }} seats</p>
            </div>
          </div>
          <div class="flex justify-end">
            <UButton
              color="primary"
              variant="ghost"
              icon="i-lucide-edit"
              @click="editVehicle"
            >
              Edit Vehicle
            </UButton>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          No vehicle information added
        </div>
      </UCard>

      <!-- Recent Trips -->
      <UCard v-if="!isAdmin">
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
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Security</h3>
            <UButton
              v-if="!showPasswordForm"
              color="primary"
              variant="ghost"
              icon="i-lucide-key"
              @click="showPasswordForm = true"
            >
              Change Password
            </UButton>
          </div>
        </template>
        
        <div v-if="showPasswordForm" class="space-y-4">
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

        <template #footer v-if="showPasswordForm">
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="cancelPasswordChange"
            >
              Cancel
            </UButton>
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

    <!-- Vehicle Modal (Driver Only) -->
    <UModal v-if="isDriver" v-model="showVehicleModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">{{ vehicle ? 'Edit' : 'Add' }} Vehicle</h3>
        </template>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Vehicle Number</label>
            <UInput
              v-model="vehicleForm.number"
              placeholder="Enter vehicle number"
              class="mt-1"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">License Plate</label>
            <UInput
              v-model="vehicleForm.license_plate"
              placeholder="Enter license plate"
              class="mt-1"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Model</label>
            <UInput
              v-model="vehicleForm.model"
              placeholder="Enter vehicle model"
              class="mt-1"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">Capacity</label>
            <UInput
              v-model="vehicleForm.capacity"
              type="number"
              placeholder="Enter seating capacity"
              class="mt-1"
            />
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showVehicleModal = false"
            >
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isUpdatingVehicle"
              @click="saveVehicle"
            >
              {{ vehicle ? 'Update' : 'Add' }} Vehicle
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>

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

<script setup lang="ts">
import { useSupabaseUser, useSupabaseClient } from '#imports'
import type { Database } from '@/types/supabase'

const props = defineProps<{
  role: 'admin' | 'driver' | 'passenger'
}>()

const supabase = useSupabaseClient<Database>()
const authUser = useSupabaseUser()
const router = useRouter()

const user = ref<Database['public']['Tables']['users']['Row'] | null>(null)
type Trip = Database['public']['Tables']['trips']['Row'] & {
  amount?: number
  status?: string
}

type Vehicle = {
  id: string
  number: string
  license_plate: string
  model: string
  capacity: number
  driver_id: string
  created_at: string | null
  updated_at: string | null
}

const trips = ref<Trip[]>([])
const vehicle = ref<Vehicle | null>(null)
const isLoading = ref(false)
const isLoadingTrips = ref(false)
const isUpdating = ref(false)
const isUpdatingVehicle = ref(false)
const isChangingPassword = ref(false)
const isDeleting = ref(false)
const showDeleteModal = ref(false)
const showVehicleModal = ref(false)
const showPasswordForm = ref(false)

const form = reactive({
  name: ''
})

const vehicleForm = reactive({
  number: '',
  license_plate: '',
  model: '',
  capacity: 0
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed properties for role-specific UI
const isAdmin = computed(() => props.role === 'admin')
const isDriver = computed(() => props.role === 'driver')
const isPassenger = computed(() => props.role === 'passenger')

const roleIcon = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'i-lucide-shield'
    case 'driver':
      return 'i-lucide-steering-wheel'
    case 'passenger':
      return 'i-lucide-user'
  }
})

const roleName = computed(() => {
  return props.role.charAt(0).toUpperCase() + props.role.slice(1)
})

const roleColor = computed(() => {
  switch (props.role) {
    case 'admin':
      return 'error'
    case 'driver':
    case 'passenger':
      return 'primary'
  }
})

const showBalance = computed(() => !isAdmin.value)
const balanceLabel = computed(() => isDriver.value ? 'Total Earnings' : 'Balance')

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

// Fetch vehicle information (Driver only)
const fetchVehicle = async () => {
  if (!isDriver.value || !authUser.value?.id) return

  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('driver_id', authUser.value.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (data) {
      vehicle.value = {
        ...data,
        number: data.vehicle_number // Map vehicle_number to number
      } as Vehicle
      Object.assign(vehicleForm, {
        number: data.vehicle_number,
        license_plate: data.license_plate,
        model: data.model,
        capacity: data.capacity
      })
    }
  } catch (error) {
    console.error('Error fetching vehicle:', error)
  }
}

// Fetch user trips
const fetchTrips = async () => {
  if (isAdmin.value || !authUser.value?.id) return

  try {
    isLoadingTrips.value = true
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq(isDriver.value ? 'driver_id' : 'passenger_id', authUser.value.id)
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

// Edit vehicle
const editVehicle = () => {
  if (vehicle.value) {
    Object.assign(vehicleForm, {
      number: vehicle.value.number,
      license_plate: vehicle.value.license_plate,
      model: vehicle.value.model,
      capacity: vehicle.value.capacity
    })
    showVehicleModal.value = true
  }
}

// Save vehicle
const saveVehicle = async () => {
  if (!authUser.value?.id) return

  try {
    isUpdatingVehicle.value = true
    const vehicleData = {
      vehicle_number: vehicleForm.number, // Map number to vehicle_number
      license_plate: vehicleForm.license_plate,
      model: vehicleForm.model,
      capacity: vehicleForm.capacity,
      driver_id: authUser.value.id,
      updated_at: new Date().toISOString()
    }

    if (vehicle.value) {
      // Update existing vehicle
      const { error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', vehicle.value.id)

      if (error) throw error
    } else {
      // Insert new vehicle
      const { error } = await supabase
        .from('vehicles')
        .insert(vehicleData)

      if (error) throw error
    }

    await fetchVehicle()
    showVehicleModal.value = false

    useToast().add({
      title: 'Success',
      description: `Vehicle ${vehicle.value ? 'updated' : 'added'} successfully`,
      color: 'success'
    })
  } catch (error) {
    console.error('Error saving vehicle:', error)
    useToast().add({
      title: 'Error',
      description: `Failed to ${vehicle.value ? 'update' : 'add'} vehicle`,
      color: 'error'
    })
  } finally {
    isUpdatingVehicle.value = false
  }
}

// Change password
const cancelPasswordChange = () => {
  showPasswordForm.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

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

    // Clear password form and hide it
    cancelPasswordChange()

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
  if (isDriver.value) {
    fetchVehicle()
  }
  if (!isAdmin.value) {
    fetchTrips()
  }
})
</script> 