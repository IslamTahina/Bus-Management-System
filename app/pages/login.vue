<template>
  <div class="min-h-screen bg-white p-6">
    <!-- Header -->
    <div class="space-y-2 mb-8">
      <h1 class="text-3xl font-bold">Welcome Back</h1>
      <p class="text-gray-600">Login to access your account</p>
    </div>

    <!-- Login Method Switcher -->
    <div class="flex gap-4 mb-6">
      <button
        @click="loginMethod = 'phone'"
        :class="[
          'px-4 py-2 rounded-full transition-colors',
          loginMethod === 'phone' 
            ? 'bg-[#E8F3D6] text-black' 
            : 'bg-gray-100 text-gray-600'
        ]"
      >
        Phone Number
      </button>
      <button
        @click="loginMethod = 'email'"
        :class="[
          'px-4 py-2 rounded-full transition-colors',
          loginMethod === 'email' 
            ? 'bg-[#E8F3D6] text-black' 
            : 'bg-gray-100 text-gray-600'
        ]"
      >
        Email
      </button>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Phone/Email Input -->
      <div class="space-y-2">
        <label class="block text-gray-700">{{ loginMethod === 'phone' ? 'Phone Number' : 'Email' }}</label>
        <div class="relative">
          <input
            :type="loginMethod === 'phone' ? 'tel' : 'email'"
            :placeholder="loginMethod === 'phone' ? '+880 1775472701' : 'Enter your email'"
            class="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E8F3D6] focus:border-transparent"
            required
          />
        </div>
      </div>

      <!-- Password Input -->
      <div class="space-y-2">
        <label class="block text-gray-700">Password</label>
        <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            class="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E8F3D6] focus:border-transparent"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          >
            <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" size="20" />
          </button>
        </div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" class="rounded border-gray-300 text-[#E8F3D6] focus:ring-[#E8F3D6]" />
          <span class="text-gray-600">Remember me</span>
        </label>
        <NuxtLink to="/forgot-password" class="text-[#7C5DFA] hover:underline">
          Forget password?
        </NuxtLink>
      </div>

      <!-- Login Button -->
      <button
        type="submit"
        class="w-full py-3 bg-[#E8F3D6] text-black rounded-full hover:bg-[#d9e7bf] transition-colors"
      >
        Log In
      </button>

      <!-- Social Login -->
      <div class="mt-6">
        <div class="text-center text-gray-500 mb-4">Or Sign In With</div>
        <div class="flex gap-4 justify-center">
          <button
            type="button"
            class="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Icon name="logos:google-icon" size="20" />
            <span>Google</span>
          </button>
          <button
            type="button"
            class="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Icon name="logos:facebook" size="20" />
            <span>Facebook</span>
          </button>
        </div>
      </div>

      <!-- Sign Up Link -->
      <div class="text-center mt-6">
        <span class="text-gray-600">Don't have an account? </span>
        <NuxtLink to="/signup" class="text-[#7C5DFA] hover:underline">
          Sign Up
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup>
const loginMethod = ref('phone')
const showPassword = ref(false)

const handleLogin = () => {
  // Handle login logic here
  console.log('Login attempted')
}
</script>
  