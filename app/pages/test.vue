<template>
  <div>
    <h1>Test</h1>
  </div>
</template>

<script setup>
if (import.meta.server) {
  const config = useRuntimeConfig();
  console.log(config);
}
</script>
