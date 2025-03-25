<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '../../types/supabase'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

interface RouteInfo {
  id: string
  start_location: string
  end_location: string
  distance: number
  average_time: number
  fare: number
}

const route = ref<RouteInfo | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const debugInfo = ref('')

// Fetch driver's assigned route
const fetchAssignedRoute = async () => {
  if (!user.value) {
    error.value = 'No user found'
    isLoading.value = false
    return
  }

  try {
    // First get the driver's ID
    const { data: driverData, error: driverErr } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', user.value.id)
      .single()

    if (driverErr) throw driverErr
    if (!driverData) {
      error.value = 'Driver record not found'
      return
    }

    debugInfo.value = `Driver ID: ${driverData.id}`

    // Get the bus assigned to the driver
    const { data: busData, error: busErr } = await supabase
      .from('vehicles')
      .select('*')
      .eq('driver_id', driverData.id)
      .single()

    if (busErr) throw busErr
    if (!busData?.route) {
      route.value = null
      debugInfo.value += '\nNo route assigned to bus'
      return
    }

    debugInfo.value += `\nBus Route: ${busData.route}`

    // Get the route details
    const { data: routeData, error: routeErr } = await supabase
      .from('routes')
      .select('*')
      .eq('id', busData.route)
      .single()

    if (routeErr) throw routeErr
    route.value = routeData as RouteInfo
    debugInfo.value += '\nRoute data loaded successfully'
  } catch (err: any) {
    console.error('Error fetching assigned route:', err)
    error.value = 'Failed to load assigned route'
    debugInfo.value += `\nError: ${err.message || 'Unknown error'}`
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchAssignedRoute()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Driver Dashboard</h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <USkeleton class="h-32" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      title="Error"
      :description="error"
    />

    <!-- Debug Info (only in development) -->
    <UCard
      v-if="debugInfo"
      color="yellow"
      class="max-w-3xl"
    >
      <pre class="text-sm">{{ debugInfo }}</pre>
    </UCard>

    <!-- No Route Assigned -->
    <UAlert
      v-else-if="!route"
      color="info"
      title="No Route Assigned"
      description="You have not been assigned to any route yet."
    />

    <!-- Route Information -->
    <UCard
      v-else
      class="max-w-3xl"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">Assigned Route</h3>
          <UBadge color="primary">Active</UBadge>
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-500">From</div>
            <div class="font-medium">{{ route.start_location }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">To</div>
            <div class="font-medium">{{ route.end_location }}</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <div class="text-sm text-gray-500">Distance</div>
            <div class="font-medium">{{ route.distance }} km</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Average Time</div>
            <div class="font-medium">{{ route.average_time }} minutes</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Fare</div>
            <div class="font-medium">{{ route.fare }} tokens</div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template> 