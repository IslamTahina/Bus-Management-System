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
        <div v-show="!scanResult" class="relative aspect-video">
          <video
            ref="videoRef"
            class="w-full h-full rounded-lg"
            autoplay
            playsinline
          ></video>
          <canvas ref="canvasRef" class="hidden"></canvas>
          <div
            class="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div class="w-64 h-64 border-2 border-white rounded-lg"></div>
            <p class="mt-4">Position the QR code within the frame</p>
          </div>
        </div>

        <!-- Scan Result -->
        <div v-if="scanResult" class="text-center py-8">
          <div v-if="ProcessingPayment">
            <UIcon
              name="i-heroicons-arrow-path"
              class="mx-auto h-16 w-16 text-primary"
            />
            <h3 class="text-xl font-semibold mt-4">Processing Payment...</h3>
            <p class="text-muted mt-2">Please wait...</p>
          </div>
          <div v-else>
            <div v-if="PaymentStatus?.success">
              <UIcon
                name="i-heroicons-check-circle"
                class="mx-auto h-16 w-16 text-primary"
              />
              <h3 class="text-xl font-semibold mt-4">Payment successful!</h3>
            </div>
            <div v-else>
              <UIcon
                name="i-heroicons-x-circle"
                class="mx-auto h-16 w-16 text-primary"
              />
              <h3 class="text-xl font-semibold mt-4">Payment failed!</h3>
              <p class="text-muted mt-2">{{ PaymentStatus?.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import jsQR from "jsqr";

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const scanResult = ref<string | null>(null);
const PaymentStatus = ref<{ success: boolean; message: string } | null>(null);
const ProcessingPayment = ref<boolean>(false);
const stream = ref<MediaStream | null>(null);
const scanningInterval = ref<number | null>(null);
const tripId = ref<string | null>(null);
const tripFare = ref<number | null>(null);
const scannerLive = ref<boolean>(false);
onMounted(async () => {
  // Fetch current trip data from backend
  // For now, using mock data

  try {
    window.addEventListener("message", (event) => {
      console.log("message", event);
      if (event?.data?.type == "trip" && event?.data?.trip) {
        tripId.value = event?.data?.trip?.id;
        tripFare.value = event?.data?.trip?.fare;
      }
    });
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
});

watch(tripId, () => {
  if (tripId.value !== null && scannerLive.value == false) {
    initScanner();
  }
});

// Start Scanner
const initScanner = async () => {
  scannerLive.value = true;
  stream.value = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" },
  });

  if (videoRef.value) {
    videoRef.value.srcObject = stream.value;
    // Start scanning after video is ready
    videoRef.value.onloadedmetadata = async () => {
      while (true) {
        const result = await startScanning();
        if (result) {
          scanResult.value = result;
          await processPayment(result);
          console.log("Stream", stream.value);
          if (videoRef.value) {
            videoRef.value.srcObject = stream.value;
          }
        }
      }
    };
  }
};

// Destroy scanner
const destroyScanner = () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }
  if (scanningInterval.value) {
    clearInterval(scanningInterval.value);
  }
  scannerLive.value = false;
};

onUnmounted(() => {
  // Clean up camera stream and scanning interval
  destroyScanner();
});

const startScanning = (): Promise<string> => {
  console.log("startScanning");
  return new Promise((resolve) => {
    if (!videoRef.value || !canvasRef.value) return;
    const video = videoRef.value;
    const canvas = canvasRef.value;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Start scanning loop
    scanningInterval.value = window.setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw current video frame on canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data from canvas
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        let code = null;

        if (scanResult.value == null) {
          // Try to decode QR code
          code = jsQR(imageData.data, imageData.width, imageData.height);
        }

        if (code && code.data) {
          if (scanningInterval.value) {
            clearInterval(scanningInterval.value);
          }
          resolve(code.data);
        }
      }
    }, 100); // Scan every 100ms
  });
};

const processPayment = (qrData: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    ProcessingPayment.value = true;
    // Mock payment processing

    const { data, error } = await useSupabaseClient()
      .from("transactions")
      .insert({
        user_id: qrData,
        tokens: tripFare.value,
        transaction_type: "debit",
        trip_id: tripId.value,
      } as any);
    if (error) {
      console.error("Error processing payment:", error);
      PaymentStatus.value = {
        success: false,
        message: "insufficient balance",
      };
    } else {
      PaymentStatus.value = {
        success: true,
        message: "Payment successful",
      };
    }
    ProcessingPayment.value = false;
    setTimeout(() => {
      scanResult.value = null;
      PaymentStatus.value = null;
      ProcessingPayment.value = false;
      resolve(true);
    }, 1500);
  });
};

const resetScanner = () => {
  scanResult.value = null;
  PaymentStatus.value = null;
  ProcessingPayment.value = false;
};
</script>
