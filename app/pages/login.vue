<template>
  <div class="min-h-screen bg-[#151921] p-6 flex items-center justify-center">
    <div class="w-full max-w-md p-8 rounded-2xl bg-[#1A1F2C]">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl text-gray-200 mb-2">Sign in to your account</h1>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="login" class="space-y-6">
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

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              v-model="form.rememberMe"
              class="w-4 h-4 rounded border-gray-700 text-[#4CAF50] focus:ring-[#4CAF50] focus:ring-offset-0 bg-[#232936]"
            />
            <span class="text-gray-400 text-sm">Remember me</span>
          </label>
          <NuxtLink 
            to="/forgot-password" 
            class="text-sm text-[#4CAF50] hover:text-[#45a049] transition-colors"
          >
            Forgot password?
          </NuxtLink>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-4 bg-red-900/50 text-red-200 rounded-lg text-sm">
          {{ errorMessage }}
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          class="w-full py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors font-medium"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>

        <!-- Register Link -->
        <div class="text-center mt-6">
          <span class="text-gray-400">Don't have an account? </span>
          <NuxtLink to="/register" class="text-[#4CAF50] hover:text-[#45a049] transition-colors">
            Sign Up
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from '#imports'
import { useSupabaseClient } from '#imports'
import type { Database } from '../../types/supabase'

interface FormState {
  email: string
  password: string
  rememberMe: boolean
}

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const supabase = useSupabaseClient<Database>()
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const form = reactive<FormState>({
  email: '',
  password: '',
  rememberMe: false
})

const login = async () => {
  try {
    errorMessage.value = ''
    isLoading.value = true

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })

    if (error) {
      console.error('Login error:', error)
      errorMessage.value = error.message
      return
    }

    // Successful login
    await router.push('/')
  } catch (error) {
    console.error('Unexpected error:', error)
    errorMessage.value = 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>
  
