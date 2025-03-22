<template>
  <div class="min-h-screen p-6">
    <!-- Header -->
    <div class="max-w-3xl mx-auto mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold mb-2">Welcome, Passenger</h1>
          <p>Select a route to view details and book your journey</p>
        </div>
        <UBadge v-if="userDetails" color="primary" size="lg" class="px-4 py-2">
          Balance: {{ userDetails.balance }} tokens
        </UBadge>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-3xl mx-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <USkeleton class="h-32 w-full" />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        :title="error"
        color="red"
        variant="solid"
        class="mb-4"
      />

      <!-- Routes List -->
      <div v-else class="space-y-2">
        <template v-for="route in routes" :key="route.id">
          <!-- Route Item -->
          <UCard
            :ui="{ base: 'cursor-pointer hover:bg-gray-800', ring: '' }"
            :class="{ 'bg-gray-800': selectedRoute?.id === route.id }"
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

          <!-- Route Details Card -->
          <UCard
            v-if="selectedRoute?.id === route.id"
            class="mt-2 ml-12 bg-gray-800"
            :ui="{ ring: '', divide: '' }"
          >
            <div class="space-y-6">
              <div class="flex justify-between">
                <h3 class="text-lg font-medium">Route Details</h3>
                <UButton
                  color="gray"
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
                :disabled="userDetails?.balance < route.fare"
                @click="bookRoute"
              >
                <span v-if="userDetails?.balance >= route.fare">
                  Book This Route
                </span>
                <span v-else>
                  Insufficient Balance
                </span>
              </UButton>
            </div>
          </UCard>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import type { Database } from "../../types/supabase";
import QRCode from "qrcode";

type Route = Database["public"]["Tables"]["routes"]["Row"];

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const routes = ref<Route[]>([]);
const selectedRoute = ref<Route | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showQRModal = ref(false);
const bookingQR = ref<string | null>(null);
const userDetails = ref<{ id: string; balance: number } | null>(null);

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
      .from('users')
      .select('id, balance')
      .eq('user_id', user.value.id)
      .single()

    if (err) throw err
    userDetails.value = data
  } catch (err) {
    console.error('Error fetching user details:', err)
    error.value = 'Failed to load user details'
  }
}

// Select a route
const selectRoute = (route: Route) => {
  selectedRoute.value = selectedRoute.value?.id === route.id ? null : route;
};

// Book the selected route
const bookRoute = async () => {
  if (!selectedRoute.value || !userDetails.value) return;

  try {
    error.value = null;

    // Check if user has sufficient balance
    if (userDetails.value.balance < selectedRoute.value.fare) {
      error.value = 'Insufficient token balance';
      return;
    }
    console.log("Trying to book with tokens:", selectedRoute.value.fare);

    // Start a transaction
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_time: new Date().toISOString(),
        route_id: selectedRoute.value.id,
        customer_id: userDetails.value.id,
        payment_status: 'pending',
        tokens_used: selectedRoute.value.fare,
      })
      .select()
      .single()

    if (bookingError) throw bookingError

    // Create a transaction record for token deduction
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: userDetails.value.id,
        tokens: -selectedRoute.value.fare,
        transaction_type: 'debit',
        transaction_time: new Date().toISOString(),
      })

    if (txError) throw txError

    // Update user's balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        balance: userDetails.value.balance - selectedRoute.value.fare,
        updated_at: new Date().toISOString()
      })
      .eq('id', userDetails.value.id)

    if (updateError) throw updateError

    // Update local user details
    userDetails.value.balance -= selectedRoute.value.fare

    // Generate QR code with booking information
    const qrData = JSON.stringify({
      booking_id: booking.id,
      route_id: selectedRoute.value.id,
      customer_id: userDetails.value.id,
      tokens: selectedRoute.value.fare,
      timestamp: new Date().toISOString(),
    })

    const qrCodeDataUrl = await QRCode.toDataURL(qrData)
    bookingQR.value = qrCodeDataUrl
    showQRModal.value = true
  } catch (err) {
    console.error('Error booking route:', err)
    error.value = 'Failed to book route'
  }
}

onMounted(() => {
  fetchRoutes();
  fetchUserDetails();
});
</script>
