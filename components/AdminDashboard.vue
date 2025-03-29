<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Admin Dashboard</h1>
      <UButton
        icon="i-lucide-refresh-cw"
        @click="refreshData"
        :loading="isLoading"
      >
        Refresh
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Total Users</h3>
            <div class="text-primary">
              <Icon name="i-lucide-users" class="w-5 h-5" />
            </div>
          </div>
        </template>
        <p class="text-3xl font-bold">{{ stats.totalUsers }}</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Active Drivers</h3>
            <div class="text-primary">
              <Icon name="i-lucide-steering-wheel" class="w-5 h-5" />
            </div>
          </div>
        </template>
        <p class="text-3xl font-bold">{{ stats.activeDrivers }}</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">Total Trips</h3>
            <div class="text-primary">
              <Icon name="i-lucide-route" class="w-5 h-5" />
            </div>
          </div>
        </template>
        <p class="text-3xl font-bold">{{ stats.totalTrips }}</p>
      </UCard>
    </div>

    <!-- Recent Activity -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-medium">Recent Activity</h3>
      </template>
      <div v-if="recentActivity.length" class="space-y-4">
        <div
          v-for="activity in recentActivity"
          :key="activity.id"
          class="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <Icon :name="activity.icon" class="w-5 h-5 text-primary" />
            <div>
              <p class="font-medium">{{ activity.description }}</p>
              <p class="text-sm text-gray-500">{{ activity.timestamp }}</p>
            </div>
          </div>
          <UBadge :color="activity.status === 'completed' ? 'success' : 'warning'">
            {{ activity.status }}
          </UBadge>
        </div>
      </div>
      <div v-else class="text-center py-4 text-gray-500">
        No recent activity
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database } from '@/types/supabase'

const supabase = useSupabaseClient<Database>()
const isLoading = ref(false)

const stats = ref({
  totalUsers: 0,
  activeDrivers: 0,
  totalTrips: 0
})

const recentActivity = ref([])

const fetchStats = async () => {
  try {
    isLoading.value = true
    
    // Fetch total users
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Fetch active drivers
    const { count: driversCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'driver')
      .eq('status', 'active')

    // Fetch total trips
    const { count: tripsCount } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })

    stats.value = {
      totalUsers: usersCount || 0,
      activeDrivers: driversCount || 0,
      totalTrips: tripsCount || 0
    }

    // Fetch recent activity
    const { data: activities } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    recentActivity.value = activities?.map(trip => ({
      id: trip.id,
      description: `Trip from ${trip.start_location} to ${trip.end_location}`,
      timestamp: new Date(trip.created_at).toLocaleDateString(),
      status: trip.status,
      icon: 'i-lucide-route'
    })) || []

  } catch (error) {
    console.error('Error fetching admin stats:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  fetchStats()
}

onMounted(() => {
  fetchStats()
})
</script> 