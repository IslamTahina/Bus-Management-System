<template>
  <header class="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- User Profile -->
        <div class="flex items-center">
          <button @click="openProfileModal" class="flex items-center space-x-3">
            <img 
              :src="userProfile?.avatar_url || '/default-avatar.png'" 
              class="h-8 w-8 rounded-full object-cover"
              alt="Profile"
            />
            <span class="text-gray-700 font-medium">{{ userProfile?.full_name || 'User' }}</span>
          </button>
        </div>

        <!-- Right Side Icons -->
        <div class="flex items-center space-x-6">
          <!-- Search Routes -->
          <button @click="openSearchModal" class="text-gray-600 hover:text-gray-900">
            <Icon name="heroicons:magnifying-glass" class="h-6 w-6" />
          </button>

          <!-- QR Code -->
          <button @click="openQRModal" class="text-gray-600 hover:text-gray-900">
            <Icon name="heroicons:qr-code" class="h-6 w-6" />
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button @click="toggleNotifications" class="text-gray-600 hover:text-gray-900">
              <Icon name="heroicons:bell" class="h-6 w-6" />
              <span v-if="unreadNotifications" 
                class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                <span class="text-white text-xs">{{ unreadNotifications }}</span>
              </span>
            </button>

            <!-- Notifications Dropdown -->
            <div v-if="showNotifications" 
              class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
              <div class="px-4 py-2 border-b border-gray-100">
                <h3 class="text-sm font-semibold">Notifications</h3>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div v-if="notifications.length === 0" class="px-4 py-3 text-sm text-gray-500">
                  No notifications
                </div>
                <div v-for="notification in notifications" 
                  :key="notification.id" 
                  class="px-4 py-3 hover:bg-gray-50">
                  <p class="text-sm text-gray-800">{{ notification.message }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ notification.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProfileModal v-if="showProfileModal" @close="closeProfileModal" />
    <QRCodeModal v-if="showQRModal" @close="closeQRModal" />
    <SearchModal v-if="showSearchModal" @close="closeSearchModal" />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const userProfile = computed(() => userStore.user)

// State
const showNotifications = ref(false)
const showProfileModal = ref(false)
const showQRModal = ref(false)
const showSearchModal = ref(false)
const unreadNotifications = ref(0)
const notifications = ref([])

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