<template>
  <USlideover
    side="left"
    v-model:open="isSlideoverOpen"
    close-icon="i-heroicons-arrow-left"
  >
    <UButton icon="i-heroicons-bars-3" color="primary" variant="ghost" />
    <template #header>
      <div class="flex justify-between items-center w-full">
        <HeaderUser />
        <UButton
          icon="i-heroicons-arrow-left"
          color="primary"
          variant="ghost"
          @click="isSlideoverOpen = false"
        />
      </div>
    </template>
    <template #body>
      <UNavigationMenu
        orientation="vertical"
        :items="props.navigationLinks"
        class="data-[orientation=vertical]:w-48"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
const props = defineProps<{
  navigationLinks: NavigationMenuItem[];
}>();

// const currentView = ref("");

const isSlideoverOpen = ref(false);

const route = useRoute();

watch(
  route,
  (value) => {
    isSlideoverOpen.value = false;
  },
  { deep: true, immediate: true }
);
// const test = () => {
//   console.log("test");
// };
</script>
