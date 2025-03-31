<template>
  <UContainer class="fixed inset-0 z-50">
    <div class="relative h-full">
      <div class="absolute inset-0 bg-gray-900/75" />
      
      <div class="relative flex h-full items-center justify-center">
        <UCard :ui="{ root: 'w-[300px]' }">
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-medium">Your Personal QR Code</h2>
              <UButton
                @click="$emit('close')"
                color="neutral"
                variant="ghost"
                icon="i-heroicons-x-mark"
                size="sm"
              />
            </div>
          </template>

          <div class="flex flex-col items-center gap-4">
            <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <QRCodeVue3
                :value="qrValue || ''"
                :size="200"
                :margin="2"
                :dotsOptions="{ type: 'rounded' }"
                :cornersSquareOptions="{ type: 'extra-rounded' }"
                :cornersDotOptions="{ type: 'dot' }"
                class="dark:invert"
              />
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
              Use this QR code to quickly share your profile or check in to buses
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import QRCodeVue3 from "qrcode-vue3";

const qrValue = computed(() => {
  return useSupabaseUser().value?.id ?? '';
});

defineEmits(["close"]);
</script>
