<script setup lang="ts">
import type { Database } from "@/types/database.types";
import TripMap from "~/components/TripMap.vue";

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

type TripWithRelations = Database["public"]["Tables"]["trips"]["Row"] & {
  vehicles: Database["public"]["Tables"]["vehicles"]["Row"];
  routes: Database["public"]["Tables"]["routes"]["Row"];
};

const currentTrip = ref<TripWithRelations | null>(null);
const upcomingTrips = ref<TripWithRelations[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const passengerCount = ref(0);
const collectedFare = ref(0);

const remainingSeats = computed(() => {
  if (!currentTrip.value) return 0;
  return (currentTrip.value.seats_capacity || 0) - passengerCount.value;
});

const updatePassengerCount = (increment: boolean) => {
  if (!currentTrip.value?.routes) return;

  if (
    increment &&
    passengerCount.value < (currentTrip.value.seats_capacity || 0)
  ) {
    passengerCount.value++;
    collectedFare.value += currentTrip.value.routes.fare;
  } else if (!increment && passengerCount.value > 0) {
    passengerCount.value--;
  }
};

const formatTripDate = (dateString: string) => {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Invalid Date";
  }
};

const availableSeats = ref(0);

onMounted(async () => {
  useScannerStore().openScanner();

  await useTripsStore().getTrips();
  upcomingTrips.value = useTripsStore().trips;
  isLoading.value = false;
  // fetchTrips()
});

const topTrip = computed(() => {
  if (useTripsStore().currentActiveTrip)
    return useTripsStore().currentActiveTrip;

  return useTripsStore().trips[0];
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-7xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Driver Dashboard</h1>
      </div>

      <USkeleton v-if="isLoading" class="h-32" />

      <UAlert v-else-if="error" color="error" :title="error" />

      <div v-else-if="upcomingTrips.length">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UCard class="h-[400px]">
            <template v-if="topTrip">
              <TripMap
                :current-location="topTrip.routes.start_location"
                :destination="topTrip.routes.end_location"
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
              <div
                v-if="topTrip"
                class="flex w-full"
                :class="
                  topTrip.id == useTripsStore().currentActiveTrip?.id
                    ? 'justify-between'
                    : 'justify-end'
                "
              >
                <UButton
                  disabled
                  color="success"
                  v-if="topTrip.id == useTripsStore().currentActiveTrip?.id"
                >
                  Trip Progress
                </UButton>
                <UButton
                  @click="useTripsStore().activateTrip(topTrip.id)"
                  color="primary"
                  variant="ghost"
                  icon="i-heroicons-bolt"
                  v-if="
                    !topTrip.actual_depart_time &&
                    !useTripsStore().currentActiveTrip
                  "
                >
                  Start Trip
                </UButton>

                <UButton
                  v-else-if="!topTrip.actual_depart_time"
                  label="Depart"
                  color="primary"
                  variant="ghost"
                  icon="i-heroicons-arrow-right"
                  @click="useTripsStore().setDepartureTime()"
                />
                <UButton
                  v-else-if="
                    topTrip.actual_depart_time && !topTrip.actual_arrival_time
                  "
                  @click="useTripsStore().endTrip()"
                  color="error"
                  variant="ghost"
                  icon="i-heroicons-arrow-right-end-on-rectangle"
                >
                  End Trip
                </UButton>
              </div>
            </template>

            <template v-if="topTrip && topTrip.routes && topTrip.vehicles">
              <div class="space-y-6">
                <div>
                  <div class="text-muted">Collected Fare</div>
                  <div class="flex items-center">
                    <UIcon name="i-lucide-dollar-sign" class="size-8" />
                    <span class="font-medium text-3xl text-success-500">
                      {{ topTrip.collected_fare }}
                    </span>
                  </div>
                </div>

                <UCard>
                  <template #header>
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-medium">Route</h3>
                      <UIcon name="i-lucide-map-pin" />
                    </div>
                  </template>
                  <div class="flex items-center justify-around gap-4">
                    <div>
                      <div class="text-sm text-muted">From</div>
                      <div class="font-medium">
                        {{ topTrip.routes.start_location }}
                      </div>
                    </div>
                    <div>
                      <UIcon class="size-8" name="i-heroicons-arrow-right" />
                    </div>
                    <div>
                      <div class="text-sm text-muted">To</div>
                      <div class="font-medium">
                        {{ topTrip.routes.end_location }}
                      </div>
                    </div>
                  </div>
                </UCard>

                <div>
                  <div class="text-muted">Remaining Seats</div>
                  <div class="font-medium flex justify-between px-5 text-left">
                    <span class="text-4xl">
                      {{ topTrip.seats_capacity }}
                    </span>

                    <UButton
                      :disabled="!useTripsStore().currentActiveTrip"
                      color="info"
                      label="Passenger Left"
                      icon="i-lucide-armchair"
                      size="xl"
                      @click="useTripsStore().passangerLeft()"
                      variant="outline"
                    />

                    <UPopover>
                      <UButton
                        :disabled="!useTripsStore().currentActiveTrip"
                        color="warning"
                        icon="i-lucide-armchair"
                        variant="ghost"
                      />

                      <template #content>
                        <UCard class="p-4">
                          <form
                            @submit.prevent="
                              useTripsStore().setAvailableSeats(availableSeats)
                            "
                          >
                            <UInput v-model="availableSeats" type="number" />
                            <br />
                            <UButton type="submit" color="primary" class="my-3"
                              >Override Available Seats Manually</UButton
                            >
                          </form>
                        </UCard>
                      </template>
                    </UPopover>
                  </div>
                </div>

                <UPopover>
                  <UButton color="info" icon="i-lucide-bus" />

                  <template #content>
                    <UCard>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <div class="text-sm text-muted">Vehicle</div>
                          <div class="font-medium">
                            {{ topTrip.vehicles.model }}
                          </div>
                        </div>
                        <div>
                          <div class="text-sm text-muted">License Plate</div>
                          <div class="font-medium">
                            {{ topTrip.vehicles.license_plate }}
                          </div>
                        </div>
                      </div>
                    </UCard>
                  </template>
                </UPopover>
              </div>
            </template>
            <template v-else>
              <div class="text-center py-8">
                <h3 class="text-lg font-medium mb-2">No Active Trip</h3>
                <p class="text-muted">
                  You don't have any active trips at the moment.
                </p>
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
                      <div class="font-medium">
                        {{ formatTripDate(trip.scheduled_depart_time) }}
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-muted">Route</div>
                      <div class="font-medium">
                        {{ trip.routes.start_location }} →
                        {{ trip.routes.end_location }}
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-muted">Fare</div>
                      <div class="font-medium">
                        {{ trip.routes.fare }} tokens
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-muted">Duration</div>
                      <div class="font-medium">
                        {{ trip.routes.average_time }} minutes
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </UCard>
        </div>
      </div>
      <div v-else>
        <div class="text-center py-8">
          <h3 class="text-lg font-medium mb-2">No upcoming trips scheduled</h3>
          <p class="text-muted">
            You don't have any upcoming trips scheduled at the moment.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
