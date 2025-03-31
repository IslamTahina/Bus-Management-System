<template>
  <UContainer>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      <div class="col-span-full lg:col-span-2">
        <UCard :ui="{ root: 'bg-transparent border-none' }">
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-semibold">Quick Actions</h2>
              <UBadge v-if="userDetails" color="primary" size="lg">
                Balance: {{ userDetails.balance }} tokens
              </UBadge>
            </div>
          </template>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <UCard
              v-for="action in quickActions"
              :key="action.name"
              @click="action.onClick"
              :ui="{ root: 'cursor-pointer hover:bg-gray-800/50' }"
            >
              <div class="flex flex-col items-center justify-center p-6">
                <UIcon :name="action.icon" class="h-8 w-8 mb-2" />
                <span class="text-sm font-medium">{{ action.name }}</span>
              </div>
            </UCard>
          </div>
        </UCard>

        <!-- Available Routes -->
        <UCard :ui="{ root: 'bg-transparent border-none' }" class="mt-6">
          <template #header>
            <h2 class="text-2xl font-semibold">Available Routes</h2>
          </template>
          <div v-if="isLoading" class="text-center py-8">
            <USkeleton class="h-32" />
          </div>
          <div v-else-if="error" class="text-red-400 text-center py-8">
            {{ error }}
          </div>
          <div v-else-if="routes.length === 0" class="text-center py-8">
            No routes available
          </div>
          <div v-else class="space-y-4">
            <div v-for="route in routes" :key="route.id">
              <UCard
                :ui="{ root: 'cursor-pointer hover:bg-gray-800/50' }"
                @click="selectRoute(route)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <UIcon name="i-lucide-bus" />
                    <div>
                      <div class="font-medium">
                        {{ route.start_location }} → {{ route.end_location }}
                      </div>
                      <div class="flex gap-4 text-gray-400">
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
                  <UBadge color="primary">{{ route.fare }} tokens</UBadge>
                </div>
              </UCard>

              <!-- Route Details -->
              <UCard
                v-if="selectedRoute?.id === route.id"
                :ui="{ root: 'mt-2 ml-12' }"
              >
                <div class="flex justify-between items-start">
                  <div class="space-y-6 w-full">
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
                  </div>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-x"
                    size="sm"
                    @click.stop="selectedRoute = null"
                  />
                </div>
              </UCard>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Recent Activity -->
      <div class="col-span-full lg:col-span-1">
        <UCard :ui="{ root: 'bg-transparent border-none' }">
          <template #header>
            <h2 class="text-2xl font-semibold">Recent Activity</h2>
          </template>
          <div class="space-y-4">
            <div v-if="recentActivity.length === 0" class="text-center py-4">
              No recent activity
            </div>
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="flex items-start space-x-3 p-2"
            >
              <UIcon :name="activity.icon" class="h-5 w-5 mt-0.5" />
              <div>
                <p class="text-sm">{{ activity.description }}</p>
                <p class="text-xs text-gray-400">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Upcoming Rides -->
      <div class="col-span-full">
        <UCard :ui="{ root: 'bg-transparent border-none' }">
          <template #header>
            <h2 class="text-2xl font-semibold">Upcoming Rides</h2>
          </template>
          <div v-if="upcomingRides.length === 0" class="text-center py-8">
            No upcoming rides scheduled
          </div>
          <div v-else class="divide-y divide-gray-800">
            <div
              v-for="ride in upcomingRides"
              :key="ride.id"
              class="p-4 hover:bg-gray-800/50 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium">{{ ride.routeName }}</h3>
                  <p class="text-sm text-gray-400">{{ ride.time }}</p>
                  <p class="text-sm text-gray-400">{{ ride.status }}</p>
                </div>
                <UButton
                  @click="viewRideDetails(ride)"
                  color="success"
                  variant="ghost"
                >
                  View Details
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
    <QRCodeModal v-if="showQRModal" @close="showQRModal = false" />
  </UContainer>
</template>

<script setup lang="ts">
import type { Database } from "@/types/supabase";

type Route = Database["public"]["Tables"]["routes"]["Row"];

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

const routes = ref<Route[]>([]);
const selectedRoute = ref<Route | null>(null);
const showRouteModal = ref(false);
const isLoading = ref(true);
const error = ref<string | null>(null);
const userDetails = ref<{ id: string; balance: number } | null>(null);

const showQRModal = ref(false)

const quickActions = [
  {
    name: 'Find Route',
    icon: 'heroicons:map',
    onClick: () => {
      // TODO: Implement route search
    }
  },
  {
    name: 'QR Code',
    icon: 'heroicons:qr-code',
    onClick: () => {
      showQRModal.value = true
    }
  },
  {
    name: 'My Tickets',
    icon: 'heroicons:ticket',
    onClick: () => {
      // TODO: Navigate to tickets page
    }
  }
]

const recentActivity = reactive([
  {
    id: 1,
    icon: 'heroicons:bus',
    description: 'Completed ride from Downtown to Airport',
    time: '2 hours ago'
  },
  {
    id: 2,
    icon: 'heroicons:ticket',
    description: 'Purchased a new ticket',
    time: 'Yesterday'
  }
])

const upcomingRides = ref([
  {
    id: 1,
    routeName: 'Downtown Express',
    time: 'Today at 3:00 PM',
    status: 'Confirmed'
  },
  {
    id: 2,
    routeName: 'Airport Shuttle',
    time: 'Tomorrow at 10:00 AM',
    status: 'Pending'
  }
])

// Fetch routes from Supabase
const fetchRoutes = async () => {
  try {
    const { data, error: err } = await supabase
      .from("routes")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) throw err;
    routes.value = data;
  } catch (err) {
    console.error("Error fetching routes:", err);
    error.value = "Failed to load routes";
  } finally {
    isLoading.value = false;
  }
};

// Fetch user details including balance
const fetchUserDetails = async () => {
  if (!user.value) return null;

  try {
    const { data, error: err } = await supabase
      .from("users")
      .select("id, balance")
      .eq("id", user.value.id)
      .single();

    if (err) throw err;
    userDetails.value = data;
  } catch (err) {
    console.error("Error fetching user details:", err);
    error.value = "Failed to load user details";
  }
};

const viewRideDetails = (ride: any) => {
  // TODO: Implement ride details view
  console.log('Viewing ride details:', ride)
}

const selectRoute = (route: Route) => {
  selectedRoute.value = selectedRoute.value?.id === route.id ? null : route;
};

onMounted(() => {
  fetchRoutes();
  fetchUserDetails();
});
</script> 