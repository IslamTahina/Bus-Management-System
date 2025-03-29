<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="rounded-lg shadow p-6">
      <!-- Profile Header -->
      <div class="flex items-center space-x-6 mb-8">
        <div class="relative">
          <img 
            :src="profilePhoto || '/default-avatar.png'" 
            class="w-32 h-32 rounded-full object-cover border-4 border-primary"
            alt="Profile photo"
          />
          <button 
            @click="triggerPhotoUpload"
            class="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:opacity-90 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <input 
            type="file" 
            ref="photoInput" 
            class="hidden" 
            accept="image/*" 
            @change="handlePhotoUpload"
          >
        </div>
        <div>
          <h2 class="text-2xl font-bold">{{ user.name || 'Your Name' }}</h2>
          <p class="text-muted">{{ user.email || 'your.email@example.com' }}</p>
        </div>
      </div>

      <!-- Settings Sections -->
      <div class="space-y-6">
        <!-- Personal Information -->
        <div class="border-b pb-6">
          <h3 class="text-lg font-semibold mb-4">Personal Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium">Full Name</label>
              <input 
                v-model="user.name" 
                type="text" 
                class="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary"
              >
            </div>
            <div>
              <label class="block text-sm font-medium">Email</label>
              <input 
                v-model="user.email" 
                type="email" 
                class="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary"
              >
            </div>
            <div>
              <label class="block text-sm font-medium">Phone Number</label>
              <input 
                v-model="user.phone" 
                type="tel" 
                class="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary"
              >
            </div>
            <div>
              <label class="block text-sm font-medium">Address</label>
              <input 
                v-model="user.address" 
                type="text" 
                class="mt-1 block w-full rounded-md border shadow-sm focus:border-primary focus:ring-primary"
              >
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="border-b pb-6">
          <h3 class="text-lg font-semibold mb-4">Preferences</h3>
          <div class="space-y-4">
            <div class="flex items-center">
              <input 
                v-model="preferences.emailNotifications" 
                type="checkbox" 
                class="h-4 w-4 text-primary focus:ring-primary border rounded"
              >
              <label class="ml-2 block text-sm">Email Notifications</label>
            </div>
            <div class="flex items-center">
              <input 
                v-model="preferences.smsNotifications" 
                type="checkbox" 
                class="h-4 w-4 text-primary focus:ring-primary border rounded"
              >
              <label class="ml-2 block text-sm">SMS Notifications</label>
            </div>
            <div class="flex items-center">
              <input 
                v-model="preferences.darkMode" 
                type="checkbox" 
                class="h-4 w-4 text-primary focus:ring-primary border rounded"
              >
              <label class="ml-2 block text-sm">Dark Mode</label>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button 
            @click="saveProfile" 
            class="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const photoInput = ref<HTMLInputElement | null>(null)
const profilePhoto = ref<string | null>(null)

const user = reactive({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const preferences = reactive({
  emailNotifications: true,
  smsNotifications: false,
  darkMode: false
})

const triggerPhotoUpload = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profilePhoto.value = e.target?.result as string
      // Here you would typically upload the photo to your backend
    }
    reader.readAsDataURL(file)
  }
}

const saveProfile = () => {
  // Here you would typically save the profile data to your backend
  console.log('Saving profile:', { user, preferences })
}
</script>

