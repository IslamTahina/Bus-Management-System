<template>
  <UButton @click="openProfileModal" variant="ghost">
    <UAvatar
      :src="userProfile?.avatar_url || '/default-avatar.png'"
      size="sm"
      alt="Profile"
    />
    <span class="font-medium">{{ userProfile?.full_name || "User" }}</span>
  </UButton>

  <ProfileModal v-if="showProfileModal" @close="closeProfileModal" />
</template>
<script setup lang="ts">
interface UserProfile {
  id: string;
  avatar_url?: string;
  full_name?: string;
}

const userStore = useUserStore();
const userProfile = computed<UserProfile | null>(() => userStore.user);

const showProfileModal = ref(false);

const openProfileModal = () => {
  showProfileModal.value = true;
};

const closeProfileModal = () => {
  showProfileModal.value = false;
};
</script>
