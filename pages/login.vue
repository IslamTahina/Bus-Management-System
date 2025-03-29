<template>
  <UContainer>
    <div :class="['min-h-screen p-6 flex items-center justify-center']">
      <div :class="['w-full max-w-md']">
        <UCard :ui="{ body: 'p-3' }">
          <!-- Header -->
          <template #header>
            <div :class="['text-center']">
              <h1 :class="['text-2xl']">Sign in to your account</h1>
            </div>
          </template>

          <!-- Login Form -->
          <UForm :state="form" @submit.prevent="login" class="space-y-6">
            <!-- Email Input -->
            <UFormField label="Email" name="email">
              <UInput
                size="xl"
                placeholder="Enter your email"
                class="w-full"
                type="email"
                icon="i-lucide-mail"
                v-model="form.email"
              />
            </UFormField>
            <UFormField label="Password" name="password">
              <UInput
                v-model="form.password"
                class="w-full"
                placeholder="Password"
                size="xl"
                icon="i-lucide-lock"
                :type="showPassword ? 'text' : 'password'"
                :ui="{ trailing: 'pe-1' }"
              >
                <template #trailing>
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    :aria-pressed="showPassword"
                    aria-controls="password"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </UFormField>
            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <UCheckbox label="Remember me" />

              <ULink to="/forgot-password"> Forgot password? </ULink>
            </div>

            <!-- Error Message -->
            <div
              v-if="errorMessage"
              class="p-4 bg-red-900/50 text-red-200 rounded-lg text-sm"
            >
              {{ errorMessage }}
            </div>

            <!-- Login Button -->
            <UButton
              type="submit"
              block
              :loading="isLoading"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Signing in...</span>
              <span v-else>Sign In</span>
            </UButton>

            <!-- Register Link -->
            <div class="text-center mt-6">
              <span class="text-gray-400">Don't have an account? </span>
              <ULink to="/register"> Sign Up </ULink>
            </div>
          </UForm>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { Database } from "@/types/supabase";

interface FormState {
  email: string;
  password: string;
  rememberMe: boolean;
}

const supabase = useSupabaseClient<Database>();
const isLoading = ref(false);
const errorMessage = ref("");
const showPassword = ref(false);

const form = reactive<FormState>({
  email: "",
  password: "",
  rememberMe: false,
});

const login = async () => {
  try {
    errorMessage.value = "";
    isLoading.value = true;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      console.error("Login error:", error);
      errorMessage.value = error.message;
      return;
    }

    // Successful login
    await useRouter().push("/");
  } catch (error) {
    console.error("Unexpected error:", error);
    errorMessage.value = "An unexpected error occurred";
  } finally {
    isLoading.value = false;
  }
};
</script>
