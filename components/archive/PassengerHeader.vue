<template>
  <div>
    <!-- Toggle Menu Button and Profile -->

    <UHeader class="fixed top-0 left-0 right-0 z-50">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 align-middle">
          <div class="flex items-center gap-3 align-middle">
            <!-- Navigation Slideover -->
            <HeaderNavigation :navigationLinks="navigationLinks" />

            <HeaderUser />
          </div>
          <!-- Right Side Icons -->
          <div class="flex items-center space-x-6">
            <!-- Search Routes -->
            <UButton
              @click="openSearchModal"
              variant="ghost"
              icon="heroicons:magnifying-glass"
              class="h-6 w-6"
            />

            <!-- QR Code -->
            <UButton
              @click="openQRModal"
              variant="ghost"
              icon="heroicons:qr-code"
              class="h-6 w-6"
            />

            <!-- Notifications -->
            <div class="relative">
              <UButton
                @click="toggleNotifications"
                variant="ghost"
                icon="heroicons:bell"
                class="h-6 w-6"
              >
                <UBadge
                  v-if="unreadNotifications"
                  color="error"
                  size="xs"
                  class="absolute -top-1 -right-1"
                >
                  {{ unreadNotifications }}
                </UBadge>
              </UButton>

              <!-- Notifications Dropdown -->
              <UCard
                v-if="showNotifications"
                :ui="{ root: 'absolute right-0 mt-2 w-80 z-50' }"
              >
                <template #header>
                  <h3 class="text-sm font-semibold">Notifications</h3>
                </template>
                <div class="max-h-96 overflow-y-auto">
                  <div
                    v-if="notifications.length === 0"
                    class="text-sm text-gray-500"
                  >
                    No notifications
                  </div>
                  <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="py-3 hover:bg-gray-50"
                  >
                    <p class="text-sm">{{ notification.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ notification.time }}
                    </p>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </UHeader>

    <!-- Modals -->
    <QRCodeModal v-if="showQRModal" @close="closeQRModal" />
    <SearchModal v-if="showSearchModal" @close="closeSearchModal" />
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

import { useUserStore } from "~/stores/user";

interface Notification {
  id: string;
  message: string;
  time: string;
}

const router = useRouter();
const userStore = useUserStore();

// State
const isSidebarOpen = inject("isSidebarOpen", ref(false));
const showNotifications = ref(false);
const showQRModal = ref(false);
const showSearchModal = ref(false);
const unreadNotifications = ref(0);
const notifications = ref<Notification[]>([]);
const currentView = ref("dashboard");

// Methods
const navigateTo = (view: string) => {
  currentView.value = view;
  router.push(`/passenger/${view}`);
  isSidebarOpen.value = false;
};

const signOut = async () => {
  const supabase = useSupabaseClient();
  try {
    await supabase.auth.signOut();
    router.push("/login");
  } catch (err) {
    console.error("Error signing out:", err);
  }
};

// Navigation links
const navigationLinks: NavigationMenuItem[] = [
  {
    label: "Dashboard",
    icon: "i-lucide-layout-dashboard",
    view: "dashboard",
    to: "/passenger/dashboard",
  },
  {
    label: "Wallet",
    icon: "i-lucide-wallet",
    view: "wallet",
    to: "/passenger/wallet",
  },
  {
    label: "History",
    icon: "i-lucide-history",
    view: "history",
    to: "/passenger/history",
  },
  {
    label: "Profile",
    icon: "i-lucide-user",
    view: "profile",
    to: "/passenger/profile",
  },
  {
    label: "Sign Out",
    icon: "i-lucide-log-out",
    view: "signout",
    onSelect: signOut,
    to: "/login",
  },
];


const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

const openQRModal = () => {
  showQRModal.value = true;
};

const closeQRModal = () => {
  showQRModal.value = false;
};

const openSearchModal = () => {
  showSearchModal.value = true;
};

const closeSearchModal = () => {
  showSearchModal.value = false;
};

// Click outside to close notifications
onMounted(() => {
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".notifications-dropdown")) {
      showNotifications.value = false;
    }
  });
});
</script>
