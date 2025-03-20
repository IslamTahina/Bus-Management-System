<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '../../types/supabase'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const tokenBalance = ref(0)
const isLoading = ref(true)
const error = ref<string | null>(null)
const showPurchaseModal = ref(false)
const purchaseAmount = ref<string>('')

// Fetch token balance
const fetchTokenBalance = async () => {
  if (!user.value) return

  try {
    // First get the customer ID
    const { data: customerData, error: customerErr } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.value.id)
      .single()

    if (customerErr) throw customerErr
    if (!customerData) {
      error.value = 'Customer record not found'
      return
    }

    // Get all token transactions for the customer
    const { data: transactions, error: txErr } = await supabase
      .from('token_transactions')
      .select('tokens, transaction_type')
      .eq('customer_id', customerData.id)

    if (txErr) throw txErr

    // Calculate total balance
    const balance = transactions?.reduce((total, tx) => {
      if (tx.transaction_type === 'purchase') {
        return total + tx.tokens
      } else if (tx.transaction_type === 'booking') {
        return total - tx.tokens
      }
      return total
    }, 0) || 0

    tokenBalance.value = balance
  } catch (err) {
    console.error('Error fetching token balance:', err)
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
    // First get the customer ID
    if (!user.value?.id) {
      error.value = 'User not found'
      return
    }

    const { data: customerData, error: customerErr } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.value.id)
      .single()

    if (customerErr) throw customerErr
    if (!customerData) {
      error.value = 'Customer record not found'
      return
    }

    const { error: err } = await supabase
      .from('token_transactions')
      .insert({
        tokens: amount,
        transaction_type: 'purchase',
        customer_id: customerData.id
      })

    if (err) throw err

    // Update local token balance
    tokenBalance.value += amount
    showPurchaseModal.value = false
    purchaseAmount.value = ''
  } catch (err) {
    console.error('Error purchasing tokens:', err)
    error.value = 'Failed to purchase tokens'
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
          <UButton
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
    <UModal 
      v-model="showPurchaseModal"
      :close-button="false"
      :prevent-close="true"
    >
      <UCard>
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
    </UModal>
  </div>
</template> 