<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database } from '../../types/supabase'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const isLoading = ref(true)
const error = ref<string | null>(null)
const transactions = ref<any[]>([])
const trips = ref<any[]>([])

// Fetch user's transaction history
const fetchTransactions = async () => {
  if (!user.value) {
    console.log('No user found')
    return
  }

  try {
    console.log('Fetching customer ID for user:', user.value.id)
    // Get customer ID
    const { data: customerData, error: customerErr } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.value.id)
      .single()

    if (customerErr) {
      console.error('Customer fetch error:', customerErr)
      throw customerErr
    }
    if (!customerData) {
      console.log('No customer data found')
      error.value = 'Customer record not found'
      return
    }

    console.log('Found customer:', customerData)

    // Get all token transactions
    const { data: txData, error: txErr } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('customer_id', customerData.id)
      .order('created_at', { ascending: false })

    if (txErr) {
      console.error('Transaction fetch error:', txErr)
      throw txErr
    }
    
    console.log('Transactions found:', txData)
    transactions.value = txData || []
  } catch (err) {
    console.error('Error fetching transactions:', err)
    error.value = 'Failed to load transaction history'
  }
}

// Fetch user's trip history
const fetchTrips = async () => {
  if (!user.value) {
    console.log('No user found')
    return
  }

  try {
    console.log('Fetching customer ID for user:', user.value.id)
    // Get customer ID
    const { data: customerData, error: customerErr } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.value.id)
      .single()

    if (customerErr) {
      console.error('Customer fetch error:', customerErr)
      throw customerErr
    }
    if (!customerData) {
      console.log('No customer data found')
      return
    }

    console.log('Found customer:', customerData)

    // Get all bookings
    const { data: bookingData, error: bookingErr } = await supabase
      .from('bookings')
      .select('*, routes(*)')
      .eq('customer_id', customerData.id)
      .order('created_at', { ascending: false })

    if (bookingErr) {
      console.error('Booking fetch error:', bookingErr)
      throw bookingErr
    }
    
    console.log('Bookings found:', bookingData)
    trips.value = bookingData || []
  } catch (err) {
    console.error('Error fetching trips:', err)
    error.value = 'Failed to load trip history'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTransactions()
  fetchTrips()
})

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Debug Info - Always show this while developing -->
    <div class="mb-4">
      <UAlert
        color="info"
        :title="'Debug Info'"
      >
        <p>User ID: {{ user?.id }}</p>
        <p>Loading: {{ isLoading }}</p>
        <p>Error: {{ error }}</p>
        <p>Transaction Count: {{ transactions.length }}</p>
        <p>Trip Count: {{ trips.length }}</p>
      </UAlert>
    </div>

    <UTabs :ui="{ list: { background: 'white' } }" default-selected="transactions">
      <UTab name="transactions" label="Transactions">
        <UCard>
          <!-- Loading State -->
          <div v-if="isLoading">
            <USkeleton v-for="i in 3" :key="i" class="mb-2" />
          </div>

          <!-- Empty State -->
          <div v-else-if="transactions.length === 0">
            <p>No transactions found.</p>
          </div>

          <!-- Transactions List -->
          <UTable
            v-else
            :rows="transactions"
            :columns="[
              {
                key: 'created_at',
                label: 'Date',
                sortable: true
              },
              {
                key: 'transaction_type',
                label: 'Type'
              },
              {
                key: 'tokens',
                label: 'Tokens'
              }
            ]"
          >
            <template #created_at-data="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
            <template #tokens-data="{ row }">
              <span :class="row.transaction_type === 'purchase' ? 'text-green-600' : 'text-red-600'">
                {{ row.transaction_type === 'purchase' ? '+' : '-' }}{{ Math.abs(row.tokens) }}
              </span>
            </template>
          </UTable>
        </UCard>
      </UTab>

      <UTab name="trips" label="Trips">
        <UCard>
          <!-- Loading State -->
          <div v-if="isLoading">
            <USkeleton v-for="i in 3" :key="i" class="mb-2" />
          </div>

          <!-- Empty State -->
          <div v-else-if="trips.length === 0">
            <p>No trips found.</p>
          </div>

          <!-- Trips List -->
          <UTable
            v-else
            :rows="trips"
            :columns="[
              {
                key: 'booking_time',
                label: 'Date',
                sortable: true
              },
              {
                key: 'routes',
                label: 'Route'
              },
              {
                key: 'payment_status',
                label: 'Status'
              }
            ]"
          >
            <template #booking_time-data="{ row }">
              {{ formatDate(row.booking_time) }}
            </template>
            <template #routes-data="{ row }">
              {{ row.routes?.start_location }} to {{ row.routes?.end_location }}
            </template>
            <template #payment_status-data="{ row }">
              <UBadge
                :color="row.payment_status === 'paid' ? 'green' : 'yellow'"
              >
                {{ row.payment_status }}
              </UBadge>
            </template>
          </UTable>
        </UCard>
      </UTab>
    </UTabs>
  </div>
</template> 