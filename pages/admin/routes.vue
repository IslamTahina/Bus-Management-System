<script setup lang="ts">
import { useSupabaseClient } from "#imports";

interface Route {
  id: string;
  start_location: string;
  end_location: string;
  distance: number;
  average_time: number | null;
  fare: number;
  created_at?: string;
  updated_at?: string;
}

const routes = ref<Route[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const supabase = useSupabaseClient();

async function fetchRoutes() {
  try {
    const { data, error: err } = await supabase
      .from("routes")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) throw err;

    routes.value = data;
  } catch (err) {
    error.value = "Failed to load routes";
    console.error("Error:", err);
  } finally {
    loading.value = false;
  }
}

async function deleteRoute(id: string) {
  try {
    const { error: err } = await supabase
      .from("routes")
      .delete()
      .eq("id", id);

    if (err) throw err;

    // Refresh routes after deletion
    await fetchRoutes();
  } catch (err) {
    error.value = "Failed to delete route";
    console.error("Error:", err);
  }
}

onMounted(() => {
  fetchRoutes();
});
</script>

<template>
  <UContainer>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Available Routes</h1>
        <UButton
          color="primary"
          icon="i-lucide-plus"
          to="/admin/routes/new"
        >
          Add Route
        </UButton>
      </div>

      <!-- Loading State -->
      <UCard v-if="loading">
        <div class="flex items-center justify-center py-8">
          <ULoadingIcon />
        </div>
      </UCard>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        color="error"
        :title="error"
      />

      <!-- Empty State -->
      <UCard v-else-if="routes.length === 0">
        <div class="text-center py-8 text-gray-500">
          No routes available at the moment.
        </div>
      </UCard>

      <!-- Routes Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard
          v-for="route in routes"
          :key="route.id"
          :ui="{ body: 'p-4' }"
        >
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium">{{ route.start_location }} → {{ route.end_location }}</h3>
              <UBadge color="primary">{{ route.fare }} tokens</UBadge>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-gray-500">Distance</div>
                <div class="font-medium">{{ route.distance }} km</div>
              </div>
              <div>
                <div class="text-gray-500">Average Time</div>
                <div class="font-medium">{{ route.average_time || 'N/A' }} mins</div>
              </div>
            </div>

            <div class="flex justify-end space-x-2">
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-edit"
                :to="`/admin/routes/${route.id}/edit`"
              >
                Edit
              </UButton>
              <UButton
                color="error"
                variant="ghost"
                icon="i-lucide-trash"
                @click="deleteRoute(route.id)"
              >
                Delete
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

