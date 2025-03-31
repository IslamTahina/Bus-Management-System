<script setup lang="ts">
import WalletCard from '~/components/WalletCard.vue'
</script>

<template>
  <div class="container mx-auto px-4 py-8 flex justify-center">
    <div class="max-w-2xl w-full">
      <WalletCard :show-purchase="true" />
    </div>
  </div>
</template> 