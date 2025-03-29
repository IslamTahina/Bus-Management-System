<script setup>
import { usePWA } from '~/composables/usePWA';

const { isPWAInstalled, installPWA } = usePWA();
</script>

<template>
  <nav class="bg-white shadow dark:bg-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- ... existing nav content ... -->
        <div class="flex items-center">
          <!-- Add PWA install button -->
          <button
            v-if="!isPWAInstalled"
            @click="installPWA"
            class="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Install App
          </button>
          <!-- ... rest of existing buttons ... -->
        </div>
      </div>
    </div>
  </nav>
</template> 