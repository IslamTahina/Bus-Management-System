<script setup lang="ts">
import type { Database } from '../../types/supabase'
import TripMap from './TripMap.vue'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

interface TripInfo {
  id: string
  vehicle_id: string
  route_id: string
  direction: boolean
  start_time: string
  seats_capacity: number
  created_at: string | null
  updated_at: string | null
  end_time?: string | null
  vehicles: {
    id: string
    model: string
    capacity: number
    driver_id: string
    license_plate: string
  } | null
  routes: {
    id: string
    fare: number
    distance: number
    average_time: number
    end_location: string
    start_location: string
  } | null
}

const currentTrip = ref<TripInfo | null>(null)
const upcomingTrips = ref<TripInfo[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const passengerCount = ref(0)
const collectedFare = ref(0)

const mockDestinationCoords = {
  'Downtown': { lng: -73.998319, lat: 40.712034 },
  'Uptown': { lng: -74.167901, lat: 40.733790 },
  'Midtown': { lng: -73.987155, lat: 40.750539 }
}

const remainingSeats = computed(() => {
  if (!currentTrip.value) return 0
  return currentTrip.value.seats_capacity - passengerCount.value
})

const destinationLocation = computed(() => {
  if (!currentTrip.value?.routes?.start_location) return undefined
  return mockDestinationCoords[currentTrip.value.routes.end_location as keyof typeof mockDestinationCoords]
})

const currentLocation = computed(() => {
  if (!currentTrip.value?.routes?.end_location) return undefined
  return mockDestinationCoords[currentTrip.value.routes.start_location as keyof typeof mockDestinationCoords]
})

const updatePassengerCount = (increment: boolean) => {
  if (!currentTrip.value?.routes) return
  
  if (increment && passengerCount.value < currentTrip.value.seats_capacity) {
    passengerCount.value++
    collectedFare.value += currentTrip.value.routes.fare
  } else if (!increment && passengerCount.value > 0) {
    passengerCount.value--
  }
}

const fetchTrips = async () => {
  if (!user.value) {
    error.value = 'No user found'
    isLoading.value = false
    return
  }

  try {
    const { data: trips, error: tripsErr } = await supabase
      .from('trips')
      .select('*, vehicles(*), routes(*)')
      .eq('vehicles.driver_id', user.value.id)
      .order('start_time', { ascending: true })

    if (tripsErr) throw tripsErr

    if (trips && trips.length > 0) {
      const currentTripData = trips.find(trip => !(trip as any).end_time)
      
      if (currentTripData) {
        currentTrip.value = {
          id: currentTripData.id,
          vehicle_id: currentTripData.vehicle_id,
          route_id: currentTripData.route_id,
          direction: currentTripData.direction,
          start_time: currentTripData.start_time,
          seats_capacity: currentTripData.seats_capacity,
          created_at: currentTripData.created_at,
          updated_at: currentTripData.updated_at,
          end_time: null,
          vehicles: currentTripData.vehicles,
          routes: currentTripData.routes
        } as TripInfo
      } else {
        currentTrip.value = null
      }

      const currentTripIndex = trips.findIndex(trip => trip.id === currentTrip.value?.id)
      upcomingTrips.value = trips.slice(currentTripIndex + 1).map(trip => ({
        id: trip.id,
        vehicle_id: trip.vehicle_id,
        route_id: trip.route_id,
        direction: trip.direction,
        start_time: trip.start_time,
        seats_capacity: trip.seats_capacity,
        created_at: trip.created_at,
        updated_at: trip.updated_at,
        end_time: null,
        vehicles: trip.vehicles,
        routes: trip.routes
      })) as TripInfo[]
    }
  } catch (err: any) {
    console.error('Error fetching trips:', err)
    error.value = 'Failed to load trips'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTrips()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Driver Dashboard</h1>
    </div>

    <USkeleton v-if="isLoading" class="h-32" />

    <UAlert
      v-else-if="error"
      color="error"
      :title="error"
    />

    <template v-else-if="currentTrip">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UCard class="h-[400px]">
          <TripMap 
            :current-location="currentLocation"
            :destination="destinationLocation"
          />
        </UCard>

        <UCard v-if="currentTrip.routes && currentTrip.vehicles">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">Current Trip</h3>
              <div class="flex items-center gap-2">
                <UButton
                  to="/driver/scanner"
                  color="primary"
                  variant="ghost"
                  icon="i-heroicons-qr-code"
                >
                  Scan QR
                </UButton>
                <UBadge color="success">Active</UBadge>
              </div>
            </div>
          </template>

          <div class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="text-sm text-muted">From</div>
                <div class="font-medium">{{ currentTrip.routes.start_location }}</div>
              </div>
              <div>
                <div class="text-sm text-muted">To</div>
                <div class="font-medium">{{ currentTrip.routes.end_location }}</div>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <div class="text-sm text-muted">Passengers</div>
                <div class="flex items-center gap-2">
                  <UButton 
                    @click="updatePassengerCount(false)" 
                    icon="i-heroicons-minus" 
                    size="sm" 
                    :disabled="passengerCount === 0" 
                  />
                  <span class="font-medium">{{ passengerCount }}/{{ currentTrip.seats_capacity }}</span>
                  <UButton 
                    @click="updatePassengerCount(true)" 
                    icon="i-heroicons-plus" 
                    size="sm" 
                    :disabled="passengerCount === currentTrip.seats_capacity" 
                  />
                </div>
              </div>
              <div>
                <div class="text-sm text-muted">Collected Fare</div>
                <div class="font-medium">{{ collectedFare.toFixed(2) }} tokens</div>
              </div>
              <div>
                <div class="text-sm text-muted">Remaining Seats</div>
                <div class="font-medium">{{ remainingSeats }}</div>
              </div>
            </div>

            <UCard>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-sm text-muted">Vehicle</div>
                  <div class="font-medium">{{ currentTrip.vehicles.model }}</div>
                </div>
                <div>
                  <div class="text-sm text-muted">License Plate</div>
                  <div class="font-medium">{{ currentTrip.vehicles.license_plate }}</div>
                </div>
              </div>
            </UCard>
          </div>
        </UCard>

        <UCard class="md:col-span-2">
          <template #header>
            <h3 class="text-lg font-medium">Upcoming Trips</h3>
          </template>

          <div v-if="upcomingTrips.length === 0" class="text-muted">
            No upcoming trips scheduled
          </div>
          
          <div v-else class="divide-y">
            <template v-for="trip in upcomingTrips" :key="trip.id">
              <div v-if="trip.routes" class="py-4">
                <div class="grid grid-cols-4 gap-4">
                  <div>
                    <div class="text-sm text-muted">Start Time</div>
                    <div class="font-medium">{{ trip.start_time }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-muted">From</div>
                    <div class="font-medium">{{ trip.routes.start_location }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-muted">To</div>
                    <div class="font-medium">{{ trip.routes.end_location }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-muted">Expected Duration</div>
                    <div class="font-medium">{{ trip.routes.average_time }} min</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </UCard>
      </div>
    </template>

    <UAlert
      v-else
      color="info"
      title="No Active Trip"
      description="You currently have no active trips assigned."
    />
  </div>
</template> 