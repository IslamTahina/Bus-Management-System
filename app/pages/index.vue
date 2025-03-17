<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <USkeleton class="h-32 w-32" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      title="Error"
      :description="error"
      class="max-w-md mx-auto mt-8"
    />

    <!-- Not Authenticated -->
    <div v-else-if="!user" class="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 class="text-2xl font-semibold">Welcome to Bus Booking System</h1>
      <p>Please sign in to continue</p>
      <div class="space-x-4">
        <UButton to="/login">Sign In</UButton>
        <UButton to="/register" variant="outline">Sign Up</UButton>
      </div>
    </div>

    <!-- Authenticated User -->
    <div v-else>
      <!-- Passenger Dashboard -->
      <PassengerDashboard v-if="userRole === 'passenger'" />

      <!-- Driver Dashboard -->
      <DriverDashboard v-else-if="userRole === 'driver'" />

   
      <!-- Sign Out Button -->
      <div class="fixed top-4 right-4">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-log-out"
          @click="signOut"
        >
          Sign Out
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '../../types/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const isLoading = ref(true)
const error = ref('')
const userRole = ref<'passenger' | 'driver' | null>(null)

// Sign out function
const signOut = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/login')
  } catch (err) {
    console.error('Error signing out:', err)
    error.value = 'Failed to sign out'
  }
}

// Fetch user role from the database
const fetchUserRole = async () => {
  if (!user.value?.id) return

  try {
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.value.id)
      .single()

    if (fetchError) throw fetchError

    if (data?.role === 'passenger' || data?.role === 'driver') {
      userRole.value = data.role
    } else {
      userRole.value = null
    }
  } catch (err) {
    console.error('Error fetching user role:', err)
    error.value = 'Failed to load user information'
  } finally {
    isLoading.value = false
  }
}

// Watch for user changes
watch(user, (newUser) => {
  if (newUser) {
    fetchUserRole()
  } else {
    userRole.value = null
    isLoading.value = false
  }
}, { immediate: true })

</script>


