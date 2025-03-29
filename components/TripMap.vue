# <script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'

const config = useRuntimeConfig()
const props = defineProps<{
  currentLocation?: { lat: number; lng: number }
  destination?: { lat: number; lng: number }
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: mapboxgl.Map | null = null
let marker: mapboxgl.Marker | null = null
let navigationControl: mapboxgl.NavigationControl | null = null
let routeLine: mapboxgl.GeoJSONSource | null = null
// console.log(config)
// // Initialize Mapbox with your access token
// if (!config.public.mapboxToken) {
//   throw new Error('Mapbox token is not configured')
// }
mapboxgl.accessToken = "ACCESS_TOKEN" as string

const initMap = () => {
  if (!mapContainer.value) return

  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [props?.currentLocation?.lng || 0, props?.currentLocation?.lat || 0],
    zoom: 15
  })

  // Add navigation controls
  navigationControl = new mapboxgl.NavigationControl()
  map.addControl(navigationControl)

  // Add current location marker
  marker = new mapboxgl.Marker({ color: '#FF0000' })
    .setLngLat([props?.currentLocation?.lng || 0, props?.currentLocation?.lat || 0])
    .addTo(map)

  // Add route layer
  map.on('load', () => {
    map?.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    })

    map?.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    })

    routeLine = map?.getSource('route') as mapboxgl.GeoJSONSource
    if (props.destination) {
      updateRoute()
    }
  })
}

// Update the route when current location or destination changes
const updateRoute = async () => {
  if (!map || !props.destination) return

  console.log(props.currentLocation, props.destination)
//   https://api.mapbox.com/directions/v5/mapbox/driving/-73.998319%2C40.712034%3B-74.167901%2C40.73379?alternatives=true&geometries=geojson&language=en&overview=full&steps=true
  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${props?.currentLocation?.lng}%2C${props?.currentLocation?.lat}%3B${props?.destination?.lng}%2C${props?.destination?.lat}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${mapboxgl.accessToken}`
    )

    const data = await response.json()
    console.log(data)
    const route = data.routes[0].geometry.coordinates
    
    routeLine?.setData({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    })

    // Fit the map to the route
    const bounds = new mapboxgl.LngLatBounds()
    route.forEach((point: [number, number]) => {
      bounds.extend(point)
    })
    map.fitBounds(bounds, { padding: 50 })
  } catch (error) {
    console.error('Error fetching route:', error)
  }
}

// Watch for location changes
watch(() => props.currentLocation, (newLocation) => {
  if (marker && map) {
    marker.setLngLat([newLocation?.lng || 0, newLocation?.lat || 0])
    if (!props.destination) {
      map.setCenter([newLocation?.lng || 0, newLocation?.lat || 0])
    }
    if (props.destination) {
      updateRoute()
    }
  }
}, { deep: true })

// Watch for destination changes
watch(() => props.destination, () => {
  if (map && props.destination) {
    updateRoute()
  }
}, { deep: true })

onMounted(() => {
  initMap()
})
</script>

<template>
  <div ref="mapContainer" class="w-full h-full rounded-lg"></div>
</template>

<style>
@import 'mapbox-gl/dist/mapbox-gl.css';

.mapboxgl-ctrl-logo {
  display: none !important;
}

.mapboxgl-ctrl-bottom-right {
  display: none !important;
}
</style> 