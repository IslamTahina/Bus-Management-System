<template>
  <div>
    <!-- Toggle Menu Button and Profile -->
    <div class="fixed top-4 left-4 z-[100] flex items-center gap-3">
      <UButton
        icon="i-heroicons-bars-3"
        color="primary"
        variant="ghost"
        @click="isSidebarOpen = !isSidebarOpen"
      />
      <UButton
        @click="openProfileModal"
        variant="ghost"
        class="flex items-center gap-3"
      >
        <UAvatar
          :src="userProfile?.avatar_url || '/default-avatar.png'"
          size="sm"
          alt="Profile"
        />
        <span class="font-medium">{{ userProfile?.full_name || 'Driver' }}</span>
      </UButton>
    </div>

    <UHeader class="fixed top-0 left-0 right-0 z-50">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex justify-end h-16">
          <!-- Right Side Icons -->
          <div class="flex items-center space-x-6">
            <!-- Scanner -->
            <UButton
              to="/driver/scanner"
              variant="ghost"
              icon="heroicons:qr-code"
              class="h-6 w-6"
            />

            <!-- Notifications -->
            <div class="relative">
              <UButton
                @click="toggleNotifications"
                variant="ghost"
                icon="heroicons:bell"
                class="h-6 w-6"
              >
                <UBadge
                  v-if="unreadNotifications"
                  color="error"
                  size="xs"
                  class="absolute -top-1 -right-1"
                >
                  {{ unreadNotifications }}
                </UBadge>
              </UButton>

              <!-- Notifications Dropdown -->
              <UCard
                v-if="showNotifications"
                :ui="{ root: 'absolute right-0 mt-2 w-80 z-50' }"
              >
                <template #header>
                  <h3 class="text-sm font-semibold">Notifications</h3>
                </template>
                <div class="max-h-96 overflow-y-auto">
                  <div v-if="notifications.length === 0" class="text-sm text-gray-500">
                    No notifications
                  </div>
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="py-3 hover:bg-gray-50"
                  >
                    <p class="text-sm">{{ notification.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </UHeader>

    <!-- Navigation Slideover -->
    <USlideover
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
          <p class="text-sm opacity-50">Driver portal</p>
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
    </USlideover>

    <!-- Modals -->
    <ProfileModal v-if="showProfileModal" @close="closeProfileModal" />
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

interface UserProfile {
  id: string
  avatar_url?: string
  full_name?: string
}

interface Notification {
  id: string
  message: string
  time: string
}

const router = useRouter()
const userStore = useUserStore()
const userProfile = computed<UserProfile | null>(() => userStore.user)

// State
const isSidebarOpen = inject('isSidebarOpen', ref(false))
const showNotifications = ref(false)
const showProfileModal = ref(false)
const unreadNotifications = ref(0)
const notifications = ref<Notification[]>([])
const currentView = ref('dashboard')

// Methods
const navigateTo = (view: string) => {
  currentView.value = view
  router.push(`/driver/${view}`)
  isSidebarOpen.value = false
}

const signOut = async () => {
  const supabase = useSupabaseClient()
  try {
    await supabase.auth.signOut()
    router.push('/login')
  } catch (err) {
    console.error('Error signing out:', err)
  }
}

// Navigation links
const navigationLinks = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    view: 'dashboard',
    click: () => navigateTo('dashboard')
  },
  {
    label: 'Profile',
    icon: 'i-lucide-user',
    view: 'profile',
    click: () => navigateTo('profile')
  },
  {
    label: 'Sign Out',
    icon: 'i-lucide-log-out',
    view: 'signout',
    click: signOut
  }
]

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const openProfileModal = () => {
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
}

// Click outside to close notifications
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.notifications-dropdown')) {
      showNotifications.value = false
    }
  })
})
</script> 