<template>
  <UApp>
    <AdminHeader />
    <main 
      class="transition-all duration-300 ease-in-out pt-14"
      :class="{ 'pl-64': isSidebarOpen }"
    >
      <slot />
    </main>
  </UApp>
</template>

<script setup lang="ts">

const isSidebarOpen = ref(false)

// Watch for sidebar state changes from header component
provide('isSidebarOpen', isSidebarOpen)
</script> 