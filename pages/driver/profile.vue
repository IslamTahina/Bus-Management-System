
<script setup lang="ts">
const photoInput = ref<HTMLInputElement | null>(null)
const profilePhoto = ref<string | null>(null)

const user = reactive({
  name: '',
  email: '',
  phone: '',
  license: ''
})

const vehicle = reactive({
  model: '',
  licensePlate: '',
  capacity: 0
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
  console.log('Saving profile:', { user, vehicle, preferences })
}
</script> 