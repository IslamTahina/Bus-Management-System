<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="max-w-3xl mx-auto mb-8">
      <h1 class="text-2xl font-semibold mb-2">Welcome, Passenger</h1>
      <p>Select a route to view details and book your journey</p>
    </div>

    <!-- Main Content -->
    <div class="max-w-3xl mx-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <USkeleton class="h-32 w-full" />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        color="error"
        title="Error"
        :description="error"
        class="max-w-md mx-auto"
      />

      <!-- Routes List -->
      <div v-else class="space-y-2">
        <template v-for="route in routes" :key="route.id">
          <!-- Route Item -->
          <div
            class="flex items-center justify-between p-4 rounded-lg hover:bg-gray-800 cursor-pointer"
            :class="{ 'bg-gray-800': selectedRoute?.id === route.id }"
            @click="selectRoute(route)"
          >
            <div class="flex items-center gap-4">
              <UIcon name="i-lucide-bus" class="flex-shrink-0" />
              <div>
                <div class="font-medium">{{ route.start_location }} → {{ route.end_location }}</div>
                <div class="flex items-center gap-4 text-gray-400">
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-clock" size="sm" />
                    {{ route.average_time }} minutes
                  </div>
                  <div class="flex items-center gap-1">
                    <UIcon name="i-lucide-map-pin" size="sm" />
                    {{ route.distance }} km
                  </div>
                </div>
              </div>
            </div>
            <UBadge color="primary" class="ml-4">{{ route.fare }} tokens</UBadge>
          </div>

          <!-- Route Details Card (shown when selected) -->
          <UCard
            v-if="selectedRoute?.id === route.id"
            class="mt-2 ml-12 bg-gray-800 border-0"
          >
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Route Details</h3>
                <UButton
                  variant="ghost"
                  icon="i-lucide-x"
                  size="sm"
                  @click="selectedRoute = null"
                />
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <div class="text-sm text-gray-400">Distance</div>
                  <div class="text-lg">{{ route.distance }} km</div>
                </div>
                <div>
                  <div class="text-sm text-gray-400">Duration</div>
                  <div class="text-lg">{{ route.average_time }} minutes</div>
                </div>
              </div>

              <div>
                <div class="text-sm text-gray-400">Fare</div>
                <div class="text-lg">{{ route.fare }} tokens</div>
              </div>

              <UButton
                color="primary"
                block
                @click="bookRoute"
              >
                Book This Route
              </UButton>
            </div>
          </UCard>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database } from '../../types/supabase'

type Route = Database['public']['Tables']['routes']['Row']

const supabase = useSupabaseClient<Database>()
const routes = ref<Route[]>([])
const selectedRoute = ref<Route | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Fetch routes from Supabase
const fetchRoutes = async () => {
  try {
    const { data, error: err } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) throw err
    routes.value = data
  } catch (err) {
    console.error('Error fetching routes:', err)
    error.value = 'Failed to load routes'
  } finally {
    isLoading.value = false
  }
}

// Select a route
const selectRoute = (route: Route) => {
  selectedRoute.value = selectedRoute.value?.id === route.id ? null : route
}

// Book the selected route
const bookRoute = async () => {
  if (!selectedRoute.value) return

  try {
    // TODO: Implement booking logic
    console.log('Booking route:', selectedRoute.value.id)
    selectedRoute.value = null
  } catch (err) {
    console.error('Error booking route:', err)
    error.value = 'Failed to book route'
  }
}

onMounted(() => {
  fetchRoutes()
})
</script> 