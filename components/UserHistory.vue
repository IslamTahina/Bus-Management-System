<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import type { Database } from "@/types/supabase";

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const isLoading = ref(true);
const error = ref<string | null>(null);
const transactions = ref<any[]>([]);
const trips = ref<any[]>([]);

// Fetch user's transaction history
const fetchTransactions = async () => {
  if (!user.value) {
    console.log("No user found");
    return;
  }
  const handleUpdates = (data: any) => {
    console.log("Change received!", data);
  };

  // Listen to inserts
  supabase
    .channel("users_updates")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "users" },
      handleUpdates
    )
    .subscribe();

  try {
    console.log("Fetching customer ID for user:", user.value.id);

    const { data: customerData, error: customerErr } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.value.id)
      .single();

    if (customerErr) {
      console.error("Customer fetch error:", customerErr);
      throw customerErr;
    }
    if (!customerData) {
      console.log("No customer data found");
      error.value = "Customer record not found";
      return;
    }

    console.log("Found customer:", customerData);

    // Get all token transactions
    const { data: txData, error: txErr } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", customerData.id)
      .order("created_at", { ascending: false });

    if (txErr) {
      console.error("Transaction fetch error:", txErr);
      throw txErr;
    }

    console.log("Transactions found:", txData);
    transactions.value = txData || [];
  } catch (err) {
    console.error("Error fetching transactions:", err);
    error.value = "Failed to load transaction history";
  }
};

// Fetch user's trip history
const fetchTrips = async () => {
  if (!user.value) {
    console.log("No user found");
    return;
  }

  try {
    const { data: tripData, error: tripsError } = await supabase
      .from("transactions")
      .select(
        `
        *,
        trips (
          *, routes(*)
        )
      `
      )
      .eq("user_id", user.value.id)
      .not("trip_id", "is", null);

    if (tripsError) {
      console.error("Error fetching trips:", tripsError);
      throw tripsError;
    }

    console.log("Trips found:", tripData);
    trips.value = tripData || [];
  } catch (err) {
    console.error("Error fetching trips:", err);
    error.value = "Failed to load trip history";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchTransactions();
  fetchTrips();
});

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
</script>

<template>
  <div>
    <div v-if="error" class="mb-4">
      <UAlert color="info" :title="'Debug Info'">
        <p>User ID: {{ user?.id }}</p>
        <p>Loading: {{ isLoading }}</p>
        <p>Error: {{ error }}</p>
        <p>Transaction Count: {{ transactions.length }}</p>
        <p>Trip Count: {{ trips.length }}</p>
      </UAlert>
    </div>

    <UCard>
      <div v-if="isLoading">
        <USkeleton v-for="i in 3" :key="i" class="mb-2" />
      </div>

      <div v-else-if="trips.length === 0">
        <p>No trips found.</p>
      </div>

      <!-- Trips List -->
      <div v-else class="space-y-4">
        <div
          v-for="trip in trips"
          :key="trip.id"
          class=" rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-3 flex-1">
              <div class="flex items-center space-x-4">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-2">
                      <UIcon
                        name="i-heroicons-map-pin-solid"
                        class="text-primary-500"
                      />
                      <span class="font-medium">{{
                        trip.trips?.routes?.start_location
                      }}</span>
                    </div>
                    <UIcon
                      name="i-heroicons-arrow-long-right"
                      class="text-gray-400"
                    />
                    <div class="flex items-center space-x-2">
                      <UIcon name="i-heroicons-flag" class="text-primary-500" />
                      <span class="font-medium">{{
                        trip.trips?.routes?.end_location
                      }}</span>
                    </div>
                  </div>
                  <div
                    class="mt-2 text-sm text-gray-600 flex items-center space-x-4"
                  >
                    <span class="flex items-center space-x-1">
                      <UIcon name="i-heroicons-clock" class="w-4 h-4" />
                      <span>{{ trip.trips?.start_time }}</span>
                    </span>
                    <span class="flex items-center space-x-1">
                      <UIcon name="i-heroicons-clock-circle" class="w-4 h-4" />
                      <span>{{ trip.trips?.routes?.average_time }} mins</span>
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-semibold text-primary-600">
                    {{ Math.abs(trip.tokens) }} tokens
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(trip.created_at) }}
                  </div>
                </div>
              </div>

              <!-- Trip Details -->
              <div class="flex items-center space-x-6 text-sm text-gray-600">
                <div class="flex items-center space-x-1">
                  <UIcon name="i-heroicons-map" class="w-4 h-4" />
                  <span>{{ trip.trips?.routes?.distance }} km</span>
                </div>
                <div class="flex items-center space-x-1">
                  <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
                  <span>${{ trip.trips?.routes?.fare }}</span>
                </div>
                <div class="flex items-center space-x-1">
                  <UIcon name="i-heroicons-users" class="w-4 h-4" />
                  <span>{{ trip.trips?.seats_capacity }} seats</span>
                </div>
                <UBadge
                  :color="
                    trip.transaction_type === 'debit' ? 'primary' : 'success'
                  "
                  size="sm"
                  class="ml-auto"
                >
                  {{ trip.transaction_type }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
