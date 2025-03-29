<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      <div class="col-span-full lg:col-span-2">
        <h2 class="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button
            v-for="action in quickActions"
            :key="action.name"
            @click="action.onClick"
            class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon :name="action.icon" class="h-8 w-8 text-blue-500 mb-2" />
            <span class="text-sm font-medium text-gray-900">{{ action.name }}</span>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="col-span-full lg:col-span-1">
        <h2 class="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div class="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div v-if="recentActivity.length === 0" class="text-gray-500 text-center py-4">
            No recent activity
          </div>
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-start space-x-3 p-2"
          >
            <Icon :name="activity.icon" class="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p class="text-sm text-gray-900">{{ activity.description }}</p>
              <p class="text-xs text-gray-500">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Rides -->
      <div class="col-span-full">
        <h2 class="text-2xl font-semibold mb-4">Upcoming Rides</h2>
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <div v-if="upcomingRides.length === 0" class="text-gray-500 text-center py-8">
            No upcoming rides scheduled
          </div>
          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="ride in upcomingRides"
              :key="ride.id"
              class="p-4 hover:bg-gray-50"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium">{{ ride.routeName }}</h3>
                  <p class="text-sm text-gray-600">{{ ride.time }}</p>
                  <p class="text-sm text-gray-500">{{ ride.status }}</p>
                </div>
                <button
                  @click="viewRideDetails(ride)"
                  class="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'passenger',
})

const quickActions = [
  {
    name: 'Find Route',
    icon: 'heroicons:map',
    onClick: () => {
      // TODO: Implement route search
    }
  },
  {
    name: 'Scan QR',
    icon: 'heroicons:qr-code',
    onClick: () => {
      // TODO: Implement QR scanning
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
  // Mock data - replace with actual API call
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
  // Mock data - replace with actual API call
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

const viewRideDetails = (ride: any) => {
  // TODO: Implement ride details view
  console.log('Viewing ride details:', ride)
}
</script> 