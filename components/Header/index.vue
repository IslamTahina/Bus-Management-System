<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <div class="px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 align-middle">
        <div class="flex items-center gap-3 align-middle">
            <ColorModeButton/> 
          <!-- Navigation Slideover -->
          <HeaderNavigation :navigationLinks="getNavigationLinks" />
          <HeaderUser />
        </div>
        <div>
          <!-- Right Side Icons -->
          <div class="flex items-center space-x-6">
            <!-- Search Routes -->
            <UButton
              v-if="type === 'passenger'"
              @click="openSearchModal"
              variant="ghost"
              icon="heroicons:magnifying-glass"
              class="h-6 w-6"
            />

            <!-- QR Code -->
            <UButton
              v-if="type === 'passenger'"
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
    </div>
  </header>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { Notification } from "~/types/Notification";
import type { UserRole } from "~/types/userRole";

const type = ref<UserRole>("passenger");
const getNavigationLinks = computed(() => {
  return [
    ...navigationLinks[type.value],
    {
      label: "Sign Out",
      icon: "i-lucide-log-out",
      view: "signout",
      onSelect: signOut,
      to: "/login",
    },
  ];
});

const signOut = async () => {
  const supabase = useSupabaseClient();
  try {
    await supabase.auth.signOut();
    useRouter().push("/login");
  } catch (err) {
    console.error("Error signing out:", err);
  }
};
const navigationLinks: Record<
  "driver" | "passenger" | "admin",
  NavigationMenuItem[]
> = {
  passenger: [
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
  ],
  driver: [
    {
      label: "Dashboard",
      icon: "i-lucide-layout-dashboard",
      view: "dashboard",
      to: "/driver/dashboard",
    },
    {
      label: "Wallet",
      icon: "i-lucide-wallet",
      view: "wallet",
      to: "/driver/wallet",
    },
    {
      label: "Profile",
      icon: "i-lucide-user",
      view: "profile",
      to: "/driver/profile",
    },
  ],
  admin: [
    {
      label: "Dashboard",
      icon: "i-lucide-layout-dashboard",
      view: "dashboard",
      to: "/admin/dashboard",
    },
    {
      label: "Users",
      icon: "i-lucide-users",
      view: "users",
      to: "/admin/users",
    },
    {
      label: "Drivers",
      icon: "i-lucide-steering-wheel",
      view: "drivers",
      to: "/admin/drivers",
    },
    {
      label: "Routes",
      icon: "i-lucide-route",
      view: "routes",
      to: "/admin/routes",
    },
    {
      label: "Profile",
      icon: "i-lucide-user",
      view: "profile",
      to: "/admin/profile",
    },
  ],
};
const notifications = ref<Notification[]>([]);
const unreadNotifications = ref(0);

onMounted(async () => {
  await useUserStore().fetchRole();
  type.value = useUserStore().userRole ?? "passenger";
  notifications.value = await useUserStore().getNotifications();
  unreadNotifications.value = await useUserStore().getUnreadNotifications();
});

const showNotifications = ref(false);
const showQRModal = ref(false);
const showSearchModal = ref(false);

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

const launchScanner = () => {
  useScannerStore().openScanner();
};
</script>
