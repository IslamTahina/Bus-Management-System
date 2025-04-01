<template></template>

<script setup lang="ts">
import type { UserRole } from "~/types/userRole";
const session = useSupabaseSession();
console.log(session);
const userRole = ref<UserRole | null>(null);

await useUserStore().fetchRole();
userRole.value = useUserStore().userRole;

if (userRole.value === "passenger") {
  useRouter().push("/passenger/dashboard");
} else if (userRole.value === "driver") {
  useRouter().push("/driver/dashboard");
} else if (userRole.value === "admin") {
  useRouter().push("/admin/dashboard");
}
</script>
