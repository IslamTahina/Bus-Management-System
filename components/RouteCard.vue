<script setup lang="ts">
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

const props = defineProps<{
  route: Route
}>()
</script>

<template>
  <div class="route-card">
    <div class="route-content">
      <div class="markers">
        <div class="destination-marker"></div>
        <div class="path-line"></div>
        <div class="origin-marker"></div>
      </div>
      
      <div class="route-info">
        <div class="locations">
          <div class="location">
            <p class="label">From</p>
            <h3>{{ route.start_location }}</h3>
          </div>
          <div class="location">
            <p class="label">To</p>
            <h3>{{ route.end_location }}</h3>
          </div>
        </div>
        
        <div class="metrics">
          <div class="metric">{{ route.distance }} km</div>
          <div class="metric">{{ route.average_time ?? '--' }} min</div>
          <div class="metric fare">${{ route.fare.toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <button class="start-button">
      <Icon name="material-symbols:route" size="24" />
      <span>Start Riding</span>
      <div class="arrows">>></div>
    </button>
  </div>
</template>

<style scoped>
.route-card {
  background-color: #121212;
  color: white;
  padding: 1rem;
  border-radius: 1.5rem;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.route-content {
  display: flex;
  gap: 1rem;
  position: relative;
}

.markers {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
  width: 24px;
}

.path-line {
  flex: 1;
  width: 3px;
  background-color: #CCFF00;
  margin: 4px 0;
}

.destination-marker {
  width: 12px;
  height: 12px;
  background-color: white;
  border-radius: 50%;
}

.origin-marker {
  width: 12px;
  height: 12px;
  background-color: #CCFF00;
  border-radius: 50%;
}

.route-info {
  flex: 1;
  background-color: #1E1E1E;
  border-radius: 1rem;
  padding: 1rem;
}

.locations {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.location {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  color: #666;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.locations h3 {
  font-size: 1rem;
  margin: 0;
  font-weight: 500;
}

.metrics {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.metric {
  background-color: #2A2A2A;
  padding: 0.5rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.metric.fare {
  background-color: #CCFF00;
  color: black;
}

.start-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #CCFF00;
  color: black;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  width: 100%;
}

.start-button .arrows {
  margin-left: auto;
  font-weight: bold;
}
</style> 