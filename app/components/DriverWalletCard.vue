<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '../../types/supabase'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const tokenBalance = ref(0)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Fetch token balance
const fetchTokenBalance = async () => {
  if (!user.value) return

  try {
    // First get the driver's ID
    const { data: driverData, error: driverErr } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', user.value.id)
      .single()

    if (driverErr) throw driverErr
    if (!driverData) {
      error.value = 'Driver record not found'
      return
    }

    // Get the driver's token balance
    const { data: balanceData, error: balanceErr } = await supabase
      .from('token_transactions')
      .select('tokens')
      .eq('driver_id', driverData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (balanceErr) {
      // If no transactions found, balance is 0
      if (balanceErr.code === 'PGRST116') {
        tokenBalance.value = 0
        return
      }
      throw balanceErr
    }

    tokenBalance.value = balanceData?.tokens || 0
  } catch (err) {
    console.error('Error fetching token balance:', err)
    error.value = 'Failed to load token balance'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTokenBalance()
})
</script>

<template>
  <div>
    <!-- Token Balance Card -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium">My Wallet</h3>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="isLoading">
        <USkeleton class="h-8 w-24 mb-2" />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        color="error"
        :title="error"
      />

      <!-- Balance Display -->
      <div v-else class="space-y-2">
        <div class="text-sm">Available Balance</div>
        <div class="text-3xl font-semibold">{{ tokenBalance }} tokens</div>
      </div>
    </UCard>
  </div>
</template> 