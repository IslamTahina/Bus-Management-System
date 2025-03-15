<template>
    <div class="flex justify-center items-center min-h-screen">
      <UCard class="w-96">
        <template #header>
          <h2 class="text-xl font-bold text-center">Register</h2>
        </template>
  
        <UForm :state="form" @submit="register">
          <UFormGroup label="Full Name" name="name">
            <UInput v-model="form.name" placeholder="Enter your full name" />
          </UFormGroup>
  
          <UFormGroup label="Email" name="email">
            <UInput v-model="form.email" type="email" placeholder="Enter your email" />
          </UFormGroup>
  
          <UFormGroup label="Password" name="password">
            <UInput v-model="form.password" type="password" placeholder="Enter your password" />
          </UFormGroup>
  
          <UFormGroup label="Confirm Password" name="confirmPassword">
            <UInput v-model="form.confirmPassword" type="password" placeholder="Confirm your password" />
          </UFormGroup>
  
          <UAlert
            v-if="errorMessage"
            type="error"
            :title="errorMessage"
            class="mb-4"
          />
  
          <UButton
            type="submit"
            color="primary"
            block
            :loading="isLoading"
          >
            Register
          </UButton>
        </UForm>
      </UCard>
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
  