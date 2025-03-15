<template>
    <div
      class="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 container mx-auto"
    >
      <UCard class="w-full max-w-md mx-4 p-6 space-y-6">
        <div class="text-center">
          <h1 class="text-gray-500 dark:text-gray-400 mt-2">
            Sign in to your account
          </h1>
        </div>
  
        <UForm :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Email" name="email">
            <UInput
              v-model="state.email"
              type="email"
              placeholder="Enter your email"
              icon="i-heroicons-envelope"
              size="lg"
              required
            />
          </UFormField>
  
          <UFormField label="Password" name="password">
            <UInput
              v-model="state.password"
              type="password"
              placeholder="Enter your password"
              icon="i-heroicons-key"
              size="lg"
              required
            />
          </UFormField>
  
          <UButton type="submit" :loading="loading" block>
            Sign In
          </UButton>
        </UForm>
  
        <div class="text-center text-sm">
          <p class="text-gray-500 dark:text-gray-400">
            Don't have an account?
            <NuxtLink
              to="/register"
              class="text-primary-600 hover:text-primary-500 font-medium"
            >
              Create an account
            </NuxtLink>
          </p>
        </div>
      </UCard>
    </div>
  </template>
  
  <script setup lang="ts">
  definePageMeta({ layout: "auth" });
  
  const state = ref({
    email: "",
    password: ""
  });
  
  const loading = ref(false);
  const supabase = useSupabaseClient();
  const router = useRouter();
  const toast = useToast();
  
  const onSubmit = async () => {
    loading.value = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: state.value.email,
        password: state.value.password,
      });
  
      if (error) throw error;
  
      toast.add({
        id: "login-success",
        title: "Welcome back!",
        description: "Redirecting you to the dashboard...",
        icon: "i-heroicons-check-circle",
        color: "success"
      });
  
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      toast.add({
        id: "login-error",
        title: "Login Failed",
        description: err.message,
        icon: "i-heroicons-x-circle",
        color: "error"
      });
    } finally {
      loading.value = false;
    }
  };
  </script>
    <style>
  .login-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  
  .login-card {
    width: 400px;
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .register-link {
    color: #007bff;
    text-decoration: none;
  }
  
  .register-link:hover {
    text-decoration: underline;
  }
  </style>
  
