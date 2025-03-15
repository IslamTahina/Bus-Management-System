<template>
  <div class="min-h-screen bg-[#151921] p-6 flex items-center justify-center">
    <div class="w-full max-w-md p-8 rounded-2xl bg-[#1A1F2C]">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl text-gray-200 mb-2">Sign up to your account</h1>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="register" class="space-y-6">
        <!-- Full Name Input -->
        <div class="space-y-2">
          <label class="block text-gray-400 text-sm mb-1">Full Name</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="ph:user" size="20" />
            </span>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter your full name"
              class="w-full pl-12 pr-4 py-3 rounded-lg bg-[#232936] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50]"
              required
            />
          </div>
        </div>

        <!-- Email Input -->
        <div class="space-y-2">
          <label class="block text-gray-400 text-sm mb-1">Email</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="ph:envelope" size="20" />
            </span>
            <input
              v-model="form.email"
              type="email"
              placeholder="Enter your email"
              class="w-full pl-12 pr-4 py-3 rounded-lg bg-[#232936] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50]"
              required
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="space-y-2">
          <label class="block text-gray-400 text-sm mb-1">Password</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="ph:key" size="20" />
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              class="w-full pl-12 pr-12 py-3 rounded-lg bg-[#232936] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50]"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" size="20" />
            </button>
          </div>
        </div>

        <!-- Confirm Password Input -->
        <div class="space-y-2">
          <label class="block text-gray-400 text-sm mb-1">Confirm Password</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon name="ph:key" size="20" />
            </span>
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm your password"
              class="w-full pl-12 pr-12 py-3 rounded-lg bg-[#232936] border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50]"
              required
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <Icon :name="showConfirmPassword ? 'ph:eye-slash' : 'ph:eye'" size="20" />
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-4 bg-red-900/50 text-red-200 rounded-lg text-sm">
          {{ errorMessage }}
        </div>

        <!-- Register Button -->
        <button
          type="submit"
          class="w-full py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors font-medium"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Registering...</span>
          <span v-else>Sign Up</span>
        </button>

        <!-- Sign In Link -->
        <div class="text-center mt-6">
          <span class="text-gray-400">Already have an account? </span>
          <NuxtLink to="/login" class="text-[#4CAF50] hover:text-[#45a049] transition-colors">
            Sign In
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, useRouter } from '#imports'
import { useSupabaseClient } from '#imports'
import type { Database } from '../../types/supabase'

interface FormState {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface UserInsert {
  id: string
  email: string
  role: 'passenger' | 'driver'
}

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const supabase = useSupabaseClient<Database>()
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive<FormState>({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const register = async () => {
  try {
    errorMessage.value = ''
    isLoading.value = true

    // Validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      errorMessage.value = 'All fields are required.'
      return
    }

    if (form.password !== form.confirmPassword) {
      errorMessage.value = 'Passwords do not match.'
      return
    }

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name
        }
      }
    })

    if (error) {
      console.error('Supabase Auth Error:', error)
      errorMessage.value = error.message
      return
    }

    const userId = data.user?.id
    if (userId) {
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking users table:', fetchError)
        return
      }

      if (!existingUser) {
        // Insert new user
        const newUser: UserInsert = {
          id: userId,
          email: form.email,
          role: 'passenger'
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert([newUser])

        if (insertError) {
          console.error('Error inserting into users table:', insertError)
          errorMessage.value = `Database error: ${insertError.message}`
          return
        }
      }
    }

    // Redirect to login
    await router.push('/login')
  } catch (error) {
    console.error('Registration error:', error)
    errorMessage.value = 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>
  