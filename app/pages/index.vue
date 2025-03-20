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
    <div v-else class="min-h-screen">
      <!-- Toggle Menu Button -->
      <div class="fixed top-4 left-4 z-[100]">
        <UButton
          icon="i-heroicons-bars-3"
          color="primary"
          variant="ghost"
          @click="isSidebarOpen = !isSidebarOpen"
        />
      </div>

      <div class="flex pt-14">
        <!-- Side Navigation -->
        <USidebar
          v-model="isSidebarOpen"
          :class="{
            'fixed inset-y-0 left-0 z-50 w-64 top-14': true,
            'translate-x-0': isSidebarOpen,
            '-translate-x-full': !isSidebarOpen
          }"
          class="h-[calc(100vh-3.5rem)] transition-transform duration-300 ease-in-out"
        >
          <template #header>
            <div class="p-4">
              <h2 class="text-xl font-semibold">Bus System</h2>
              <p class="text-sm opacity-50">{{ userRole }} portal</p>
            </div>
          </template>

          <div class="flex-1 p-4 space-y-2">
            <UButton
              v-for="link in navigationLinks"
              :key="link.label"
              :icon="link.icon"
              variant="ghost"
              class="w-full justify-start"
              :class="{ 'bg-gray-100 dark:bg-gray-800': currentView === link.view }"
              @click="link.click"
            >
              {{ link.label }}
            </UButton>
          </div>
        </USidebar>

        <!-- Main Content -->
        <main 
          class="flex-1 transition-all duration-300 ease-in-out min-h-screen w-full"
          :class="{ 'pl-64': isSidebarOpen }"
        >
          <div class="p-4">
            <!-- Content based on current route -->
            <div v-if="currentView === 'dashboard'">
              <PassengerDashboard v-if="userRole === 'passenger'" />
              <DriverDashboard v-else-if="userRole === 'driver'" />
            </div>

            <div v-else-if="currentView === 'wallet'">
              <div class="max-w-3xl mx-auto">
                <WalletCard v-if="userRole === 'passenger'" />
                <DriverWalletCard v-else-if="userRole === 'driver'" />
              </div>
            </div>

            <div v-else-if="currentView === 'history'">
              <div class="max-w-3xl mx-auto">
                <UserHistory />
              </div>
            </div>

            <div v-else-if="currentView === 'profile'">
              <div class="max-w-3xl mx-auto">
                <h2 class="text-2xl font-semibold mb-4">Profile</h2>
                <p>Profile settings coming soon...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '../../types/supabase'
import { useRouter, useRoute } from 'vue-router'
import WalletCard from '../components/WalletCard.vue'
import DriverWalletCard from '../components/DriverWalletCard.vue'
import UserHistory from '../components/UserHistory.vue'

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const isLoading = ref(true)
const error = ref('')
const userRole = ref<'passenger' | 'driver' | null>(null)
const currentView = ref('dashboard')
const isSidebarOpen = ref(false)

// Navigation links based on user role
const navigationLinks = computed(() => {
  const baseLinks = [
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      view: 'dashboard',
      click: () => setCurrentView('dashboard')
    },
    {
      label: 'Wallet',
      icon: 'i-lucide-wallet',
      view: 'wallet',
      click: () => setCurrentView('wallet')
    },
    {
      label: 'History',
      icon: 'i-lucide-history',
      view: 'history',
      click: () => setCurrentView('history')
    },
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      view: 'profile',
      click: () => setCurrentView('profile')
    }
  ]

  // Add sign out link at the bottom
  baseLinks.push({
    label: 'Sign Out',
    icon: 'i-lucide-log-out',
    view: 'signout',
    click: signOut
  })

  return baseLinks
})

// Set current view
const setCurrentView = (view: string) => {
  currentView.value = view
}

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
  if (!user.value) return

  try {
    const { data, error: err } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.value.id)
      .single()

    if (err) throw err
    userRole.value = data.role as 'passenger' | 'driver'
  } catch (err) {
    console.error('Error fetching user role:', err)
    error.value = 'Failed to load user role'
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
  }
}, { immediate: true })
</script>




