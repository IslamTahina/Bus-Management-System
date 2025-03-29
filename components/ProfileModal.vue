<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Profile</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <Icon name="heroicons:x-mark" class="h-6 w-6" />
        </button>
      </div>

      <div class="space-y-6">
        <!-- Profile Picture -->
        <div class="flex flex-col items-center">
          <div class="relative">
            <img 
              :src="userStore?.user?.avatar_url || '/default-avatar.png'" 
              class="h-24 w-24 rounded-full object-cover"
              alt="Profile Picture"
            />
            <button 
              @click="handleImageUpload"
              class="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
            >
              <Icon name="heroicons:camera" class="h-4 w-4" />
            </button>
            <input 
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileSelected"
            />
          </div>
        </div>

        <!-- Profile Information -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              v-model="form.fullName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button
            @click="saveProfile"
            class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="loading"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)

const form = ref({
  fullName: '',
  email: '',
  phone: ''
})

onMounted(() => {
  // Initialize form with user data
  if (userStore.user) {
    form.value = {
      fullName: userStore.user.full_name || '',
      email: userStore.user.email || '',
      phone: userStore.user.phone || ''
    }
  }
})

const handleImageUpload = () => {
  fileInput.value?.click()
}

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]
  loading.value = true

  try {
    // TODO: Implement file upload logic
    // const avatarUrl = await uploadFile(file)
    // await userStore.updateProfile({ avatar_url: avatarUrl })
  } catch (error) {
    console.error('Error uploading image:', error)
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  loading.value = true
  try {
    await userStore.updateProfile({
      full_name: form.value.fullName,
      email: form.value.email,
      phone: form.value.phone
    })
    emit('close')
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['close'])
</script> 