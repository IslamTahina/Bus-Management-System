<script setup lang="ts">

import type { Database } from '@/types/supabase'
import TripMap from '~/components/TripMap.vue'

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
  end_time: string | null
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
      console.log('Raw trips data:', trips)
      const currentTime = new Date()
      console.log('Current time:', currentTime.toLocaleTimeString())
      
      const typedTrips = trips as (TripInfo & { end_time: string | null })[]
      
      // Find the current trip based on time window
      const currentTripData = typedTrips.find(trip => {
        console.log('Processing trip:', trip)
        console.log('Start time string:', trip.start_time)
        
        // Create a date object by combining current date with the time from Supabase
        const today = new Date()
        const [hours, minutes, seconds] = trip.start_time.split(':').map(Number)
        const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds)
        
        // Calculate end time based on route's average time
        const endTime = new Date(startTime.getTime() + (trip.routes?.average_time || 0) * 60000)
        
        // If start time is in the future but within 24 hours, use it
        if (startTime > currentTime) {
          const timeDiff = startTime.getTime() - currentTime.getTime()
          if (timeDiff <= 24 * 60 * 60 * 1000) { // Within 24 hours
            console.log('Trip starts in the future within 24h')
          }
        }
        
        // If the trip should have ended but hasn't, consider it active
        const shouldBeActive = currentTime >= startTime && currentTime <= endTime
        console.log('Time comparison:', {
          currentTime: currentTime.toLocaleTimeString(),
          startTime: startTime.toLocaleTimeString(),
          endTime: endTime.toLocaleTimeString(),
          shouldBeActive,
          notEnded: !trip.end_time
        })
        
        return shouldBeActive && !trip.end_time
      })
      
      if (currentTripData) {
        console.log('Found active trip:', currentTripData)
        currentTrip.value = currentTripData
      } else {
        console.log('No active trip found')
        currentTrip.value = null
      }

      const currentTripIndex = typedTrips.findIndex(trip => trip.id === currentTrip.value?.id)
      upcomingTrips.value = typedTrips.slice(currentTripIndex + 1).map(trip => ({
        ...trip,
        end_time: null
      }))
    }
  } catch (err: any) {
    console.error('Error fetching trips:', err)
    error.value = 'Failed to load trips'
  } finally {
    isLoading.value = false
  }
}

// Add a computed property for formatted date
const formatTripDate = (dateString: string) => {
  try {
    // Create a date object by combining current date with the time from Supabase
    const today = new Date()
    const [hours, minutes, seconds] = dateString.split(':').map(Number)
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds)
    
    // If the time has already passed today, set it for tomorrow
    if (date < new Date()) {
      date.setDate(date.getDate() + 1)
    }
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString)
      return 'Invalid Date'
    }
    // Format to show only time in 12-hour format
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    })
  } catch (err) {
    console.error('Error formatting date:', err)
    return 'Invalid Date'
  }
}

onMounted(() => {
  fetchTrips()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Driver Dashboard</h1>
      </div>

      <USkeleton v-if="isLoading" class="h-32" />

      <UAlert
        v-else-if="error"
        color="error"
        :title="error"
      />

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard class="h-[400px]">
            <template v-if="currentTrip">
              <TripMap 
                :current-location="currentLocation"
                :destination="destinationLocation"
              />
            </template>
            <template v-else>
              <div class="h-full flex items-center justify-center text-muted">
                No active trip to display on map
              </div>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Current Trip</h3>
                <div class="flex items-center gap-2">
                  <template v-if="currentTrip">
                    <UButton
                      to="/driver/scanner"
                      color="primary"
                      variant="ghost"
                      icon="i-heroicons-qr-code"
                    >
                      Scan QR
                    </UButton>
                    <UBadge color="success">Active</UBadge>
                  </template>
                  <template v-else>
                    <UBadge color="neutral">No Active Trip</UBadge>
                  </template>
                </div>
              </div>
            </template>

            <template v-if="currentTrip && currentTrip.routes && currentTrip.vehicles">
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
            </template>
            <template v-else>
              <div class="text-center py-8">
                <h3 class="text-lg font-medium mb-2">No Active Trip</h3>
                <p class="text-muted">You don't have any active trips at the moment.</p>
              </div>
            </template>
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
                      <div class="font-medium">{{ formatTripDate(trip.start_time) }}</div>
                    </div>
                    <div>
                      <div class="text-sm text-muted">Route</div>
                      <div class="font-medium">{{ trip.routes.start_location }} → {{ trip.routes.end_location }}</div>
                    </div>
                    <div>
                      <div class="text-sm text-muted">Fare</div>
                      <div class="font-medium">{{ trip.routes.fare }} tokens</div>
                    </div>
                    <div>
                      <div class="text-sm text-muted">Duration</div>
                      <div class="font-medium">{{ trip.routes.average_time }} minutes</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </UCard>
        </div>
      </template>
    </div>
  </div>
</template> 