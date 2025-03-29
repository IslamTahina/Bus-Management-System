<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Your Personal QR Code</h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <Icon name="heroicons:x-mark" class="h-6 w-6" />
        </button>
      </div>

      <div class="flex flex-col items-center space-y-4">
        <div class="bg-white p-4 rounded-lg shadow-sm">
          <QRCodeVue3
            :value="qrValue"
            :size="200"
            :margin="2"
            :dotsOptions="{ type: 'rounded' }"
            :cornersSquareOptions="{ type: 'extra-rounded' }"
            :cornersDotOptions="{ type: 'dot' }"
          />
        </div>
        <p class="text-sm text-gray-600 text-center">
          Use this QR code to quickly share your profile or check in to buses
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCodeVue3 from "qrcode-vue3";
const qrValue = computed(() => {
  return JSON.stringify(useSupabaseUser().value?.id);
});

defineEmits(["close"]);
</script>
