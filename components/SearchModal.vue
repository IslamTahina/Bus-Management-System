<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
  >
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Search Routes</h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700"
        >
          <Icon name="heroicons:x-mark" class="h-6 w-6" />
        </button>
      </div>

      <div class="space-y-4">
        <!-- Search Input -->
        <div class="relative">
          <Icon
            name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for routes, stops, or destinations..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="handleSearch"
          />
        </div>

        <!-- Search Results -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="loading" class="flex justify-center py-4">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
            ></div>
          </div>

          <div
            v-else-if="searchResults.length === 0 && searchQuery"
            class="text-center py-4 text-gray-500"
          >
            No routes found matching your search
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="route in searchResults"
              :key="route.id"
              class="p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
              @click="selectRoute(route)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-medium">{{ route.name }}</h3>
                  <p class="text-sm text-gray-600">
                    {{ route.startLocation }} → {{ route.endLocation }}
                  </p>
                </div>
                <div class="text-sm text-gray-500">
                  {{ route.duration }} min
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const router = useRouter();
const searchQuery = ref("");
const loading = ref(false);
const searchResults: any = ref([]);

const handleSearch = async () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }

  loading.value = true;
  try {
    // TODO: Replace with actual API call to search routes
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
    searchResults.value = [
      {
        id: 1,
        name: "Route 1",
        startLocation: "Downtown",
        endLocation: "Airport",
        duration: 30,
      },
      // Add more mock results as needed
    ];
  } catch (error) {
    console.error("Error searching routes:", error);
  } finally {
    loading.value = false;
  }
};

const selectRoute = (route: any) => {
  router.push(`/routes/${route.id}`);
  emit("close");
};

const emit = defineEmits(["close"]);
</script>
