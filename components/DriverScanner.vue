<template>
  <UContainer>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Scan Passenger QR Code</h2>
          <UButton
            v-if="scanResult"
            @click="resetScanner"
            color="primary"
            variant="ghost"
            icon="i-heroicons-camera"
          >
            Scan Again
          </UButton>
        </div>
      </template>

      <!-- Scanner Section -->
      <div class="relative">
        <div v-if="!scanResult" class="relative aspect-video">
          <video
            ref="videoRef"
            class="w-full h-full rounded-lg"
            autoplay
            playsinline
          ></video>
          <canvas ref="canvasRef" class="hidden"></canvas>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="w-64 h-64 border-2 border-white rounded-lg"></div>
            <p class="mt-4">Position the QR code within the frame</p>
          </div>
        </div>

        <!-- Scan Result -->
        <div v-if="scanResult" class="text-center py-8">
          <UIcon
            name="i-heroicons-check-circle"
            class="mx-auto h-16 w-16 text-primary"
          />
          <h3 class="text-xl font-semibold mt-4">QR Code Scanned Successfully!</h3>
          <p class="text-muted mt-2">Processing payment...</p>
        </div>
      </div>

      <!-- Current Trip Info -->
      <template v-if="currentTrip" #footer>
        <UDivider />
        <div class="space-y-4">
          <h3 class="text-lg font-semibold">Current Trip Information</h3>
          <UCard>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-muted">Route</p>
                <p class="font-medium">{{ currentTrip.route }}</p>
              </div>
              <div>
                <p class="text-sm text-muted">Fare</p>
                <p class="font-medium">{{ currentTrip.fare }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import jsQR from 'jsqr'

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const scanResult = ref<string | null>(null)
const currentTrip = ref<any>(null)
const stream = ref<MediaStream | null>(null)
const scanningInterval = ref<number | null>(null)

// Mock current trip data 
const mockCurrentTrip = {
  route: 'Downtown Express',
  fare: 2.50
}

onMounted(async () => {
  // Fetch current trip data from backend
  // For now, using mock data
  currentTrip.value = mockCurrentTrip
  
  try {
    // Request camera access
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
      // Start scanning after video is ready
      videoRef.value.onloadedmetadata = () => {
        videoRef.value?.play()
        startScanning()
      }
    }
  } catch (error) {
    console.error('Error accessing camera:', error)
    // Handle camera access error
  }
})

onUnmounted(() => {
  // Clean up camera stream and scanning interval
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
  if (scanningInterval.value) {
    clearInterval(scanningInterval.value)
  }
})

const startScanning = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')

  if (!context) return

  // Set canvas size to match video
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Start scanning loop
  scanningInterval.value = window.setInterval(() => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Draw current video frame on canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      // Try to decode QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        // QR code found
        onDecode(code.data)
        // Stop scanning
        if (scanningInterval.value) {
          clearInterval(scanningInterval.value)
        }
      }
    }
  }, 100) // Scan every 100ms
}

const onDecode = async (decodedString: string) => {
  scanResult.value = decodedString
  try {
    await processPayment(decodedString)
  } catch (error) {
    console.error('Error processing payment:', error)
  }
}

const processPayment = async (qrData: string) => {
  // Mock payment processing
  await new Promise(resolve => setTimeout(resolve, 2000))
  // Here you would make an API call to your backend
  console.log('Processing payment for:', qrData)
}

const resetScanner = () => {
  scanResult.value = null
  // Restart scanning
  startScanning()
}
</script> 