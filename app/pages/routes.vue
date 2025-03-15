<script setup lang="ts">
import { useSupabaseClient } from '#imports'

interface Route {
  id: string
  start_location: string
  end_location: string
  distance: number
  average_time: number | null
  fare: number
  created_at?: string
  updated_at?: string
}

const routes = ref<Route[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const supabase = useSupabaseClient()

async function fetchRoutes() {
  try {
    const { data, error: err } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) throw err

    routes.value = data
  } catch (err) {
    error.value = 'Failed to load routes'
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoutes()
})
</script>

<template>
  <div class="routes-page">
    <div class="header">
      <h1>Available Routes</h1>
      <p class="subtitle">Choose your destination from our available routes</p>
    </div>

    <div v-if="loading" class="loading">
      Loading routes...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="routes.length === 0" class="no-routes">
      No routes available at the moment.
    </div>

    <div v-else class="routes-grid">
      <RouteCard
        v-for="route in routes"
        :key="route.id"
        :route="route"
      />
    </div>
  </div>
</template>

<style scoped>
.routes-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
  text-align: center;
}

.header h1 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.routes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  align-items: start;
}

.loading,
.error,
.no-routes {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #666;
}

.error {
  color: #dc3545;
}

@media (max-width: 768px) {
  .routes-page {
    padding: 1rem;
  }

  .routes-grid {
    grid-template-columns: 1fr;
  }
}
</style> 