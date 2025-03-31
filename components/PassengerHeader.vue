<template>
  <UHeader class="fixed top-0 left-0 right-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- User Profile -->
        <div class="flex items-center">
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
            <span class="font-medium">{{ userProfile?.full_name || 'User' }}</span>
          </UButton>
        </div>

        <!-- Right Side Icons -->
        <div class="flex items-center space-x-6">
          <!-- Search Routes -->
          <UButton
            @click="openSearchModal"
            variant="ghost"
            icon="heroicons:magnifying-glass"
            class="h-6 w-6"
          />

          <!-- QR Code -->
          <UButton
            @click="openQRModal"
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

    <!-- Modals -->
    <ProfileModal v-if="showProfileModal" @close="closeProfileModal" />
    <QRCodeModal v-if="showQRModal" @close="closeQRModal" />
    <SearchModal v-if="showSearchModal" @close="closeSearchModal" />
  </UHeader>
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

const userStore = useUserStore()
const userProfile = computed<UserProfile | null>(() => userStore.user)

// State
const showNotifications = ref(false)
const showProfileModal = ref(false)
const showQRModal = ref(false)
const showSearchModal = ref(false)
const unreadNotifications = ref(0)
const notifications = ref<Notification[]>([])

// Methods
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const openProfileModal = () => {
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
}

const openQRModal = () => {
  showQRModal.value = true
}

const closeQRModal = () => {
  showQRModal.value = false
}

const openSearchModal = () => {
  showSearchModal.value = true
}

const closeSearchModal = () => {
  showSearchModal.value = false
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