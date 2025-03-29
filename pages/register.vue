<template>
  <div class="min-h-screen p-6 flex items-center justify-center">
    <UCard class="w-full max-w-md p-3">
      <!-- Header -->
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl">Sign up to your account</h1>
        </div>
      </template>

      <!-- Register Form -->
      <UForm :state="form" @submit.prevent="register" class="space-y-6">
        <!-- Full Name Input -->
        <UFormField label="Full Name" name="name">
          <UInput
            v-model="form.name"
            size="xl"
            placeholder="Enter your full name"
            icon="i-lucide-user"
            class="w-full"
          />
        </UFormField>

        <!-- Email Input -->
        <UFormField label="Email" name="email">
          <UInput
            v-model="form.email"
            type="email"
            size="xl"
            placeholder="Enter your email"
            icon="i-lucide-mail"
            class="w-full"
          />
        </UFormField>

        <!-- Password Input -->
        <UFormField label="Password" name="password">
          <UInput
            v-model="form.password"
            class="w-full"
            placeholder="Enter your password"
            size="xl"
            :type="showPassword ? 'text' : 'password'"
            :ui="{ trailing: 'pe-1' }"
            icon="i-lucide-lock"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Confirm Password Input -->
        <UFormField label="Confirm Password" name="confirmPassword">
          <UInput
            v-model="form.confirmPassword"
            class="w-full"
            placeholder="Confirm your password"
            size="xl"
            :type="showConfirmPassword ? 'text' : 'password'"
            :ui="{ trailing: 'pe-1' }"
            icon="i-lucide-lock"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="
                  showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                "
                :aria-label="
                  showConfirmPassword ? 'Hide password' : 'Show password'
                "
                :aria-pressed="showConfirmPassword"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="p-4 bg-red-900/50 text-red-200 rounded-lg text-sm"
        >
          {{ errorMessage }}
        </div>

        <!-- Register Button -->
        <UButton type="submit" block :loading="isLoading" :disabled="isLoading">
          {{ isLoading ? "Registering..." : "Sign Up" }}
        </UButton>

        <!-- Sign In Link -->
        <div class="text-center mt-6">
          <span class="text-gray-400">Already have an account? </span>
          <ULink to="/login">Sign In</ULink>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "#imports";
import { useSupabaseClient } from "#imports";
import type { Database } from "@/types/supabase";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}


const supabase = useSupabaseClient<Database>();
const isLoading = ref(false);
const errorMessage = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = reactive<FormState>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const register = async () => {
  try {
    errorMessage.value = "";
    isLoading.value = true;

    // Validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      errorMessage.value = "All fields are required.";
      return;
    }

    if (form.password !== form.confirmPassword) {
      errorMessage.value = "Passwords do not match.";
      return;
    }

    // Sign up user
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
        },
      },
    })

    if (error) {
      console.error("Supabase Auth Error:", error);
      errorMessage.value = error.message;
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: insertError } = await supabase.from("users").insert({
        name: form.name
      });

      if (insertError) {
        console.error("Error inserting into users table:", insertError);
        errorMessage.value = `Database error: ${insertError.message}`;
        return;
      }
    }

    await useRouter().push("/");
  } catch (error) {
    console.error("Registration error:", error);
    errorMessage.value = "An unexpected error occurred";
  } finally {
    isLoading.value = false;
  }
};
</script>
