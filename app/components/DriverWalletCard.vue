<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '../../types/supabase'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const tokenBalance = ref(0)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Fetch token balance and setup real-time subscription
const setupBalanceSubscription = async () => {
  if (!user.value) return

  try {
    // Get initial balance
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select('balance')
      .eq('user_id', user.value.id)
      .single()

    if (userErr) throw userErr
    if (!userData) {
      error.value = 'User record not found'
      return
    }

    tokenBalance.value = userData.balance

    // Setup real-time subscription
    const subscription = supabase
      .channel('driver_balance_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `user_id=eq.${user.value.id}`
        },
        (payload) => {
          if (payload.new && 'balance' in payload.new) {
            tokenBalance.value = payload.new.balance
          }
        }
      )
      .subscribe()

    // Cleanup subscription on component unmount
    onUnmounted(() => {
      subscription.unsubscribe()
    })
  } catch (err) {
    console.error('Error setting up balance subscription:', err)
    error.value = 'Failed to load token balance'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  setupBalanceSubscription()
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