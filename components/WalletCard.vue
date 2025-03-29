<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '@/types/supabase'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const tokenBalance = ref(0)
const isLoading = ref(true)
const error = ref<string | null>(null)
const showPurchaseModal = ref(false)
const purchaseAmount = ref<string>('')

const props = defineProps<{
  showPurchase?: boolean
}>()

// Fetch token balance and setup real-time subscription
const setupBalanceSubscription = async () => {
  if (!user.value) return

  try {
    // Get initial balance
    const { data: userData, error: userErr } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user.value.id)
      .single()

    if (userErr) throw userErr
    if (!userData) {
      error.value = 'User record not found'
      return
    }

    tokenBalance.value = userData.balance

    // Setup real-time subscription
    const subscription = supabase
      .channel('balance_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.value.id}`
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

// Purchase tokens
const purchaseTokens = async () => {
  const amount = Number(purchaseAmount.value)
  if (amount <= 0) return

  try {
    if (!user.value?.id) {
      error.value = 'User not found'
      return
    }

    // Update user's balance
    const { error: updateErr } = await supabase
      .from('users')
      .update({ 
        balance: tokenBalance.value + amount 
      })
      .eq('id', user.value.id)

    if (updateErr) throw updateErr

    // Record the transaction
    const { error: txErr } = await supabase
      .from('transactions')
      .insert({
        tokens: amount,
        transaction_type: 'purchase',
        user_id: user.value.id
      })

    if (txErr) throw txErr

    showPurchaseModal.value = false
    purchaseAmount.value = ''
  } catch (err) {
    console.error('Error purchasing tokens:', err)
    error.value = 'Failed to purchase tokens'
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
          <UButton
            v-if="showPurchase"
            color="primary"
            variant="soft"
            icon="i-lucide-plus"
            @click="showPurchaseModal = true"
          >
            Buy Tokens
          </UButton>
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

    <!-- Purchase Modal -->
    <UCard v-if="showPurchase && showPurchaseModal">
      <template #header>
        <h3 class="text-lg font-medium">Purchase Tokens</h3>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Amount of tokens to purchase">
          <UButtonGroup class="w-full">
            <UInput
              v-model="purchaseAmount"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              color="neutral"
              variant="outline"
              size="lg"
              placeholder="Enter amount"
              class="flex-1"
              @keypress="(e: KeyboardEvent) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault()
                }
              }"
            />
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-coins"
              :disabled="!purchaseAmount || Number(purchaseAmount) <= 0"
              @click="purchaseTokens"
            >
              Purchase
            </UButton>
          </UButtonGroup>
          <p v-if="Number(purchaseAmount) < 0" class="text-sm text-red-500 mt-1">
            Amount must be greater than 0
          </p>
        </UFormGroup>

        <div class="text-sm text-gray-500">
          Select the number of tokens you want to purchase
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton
            variant="ghost"
            color="neutral"
            @click="showPurchaseModal = false"
          >
            Close
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template> 