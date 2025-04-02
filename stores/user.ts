import type { Notification } from "~/types/Notification";
import type { UserRole } from "~/types/userRole";

export const useUserStore = defineStore("users", {
  state: () => ({
    user: null,
    userRole: null as UserRole | null,
    isLoading: false,
    error: null,
    notifications: [],
    unreadNotifications: 0,
  }),
  actions: {
    async getNotifications(): Promise<Notification[]> {
      // Gets notification from supabase and updates the notification object in the state, also set the unread notifications to proper value
      //   const supabase = useSupabaseClient();
      //   const { data, error } = await supabase
      //     .from("notifications")
      //     .select("*")
      //     .eq("user_id", this.user?.id);
      // },
      return [];
    },
    getUnreadNotifications(): number {
      // Gets the number of unread notifications from the notification object in the state
      return this.unreadNotifications;
    },
    async fetchRole() {
      const userid = useSupabaseUser().value?.id;
      if (!userid) {
        return;
      }
      try {
        const { data, error } = await useSupabaseClient()
          .from("users")
          .select("role")
          .eq("id", userid)
          .single();
        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
        let dataTyped = data as { role: UserRole };
        this.userRole = dataTyped.role;
      } catch (err) {
        console.error("Error fetching user role:", err);
        return;
      }
    },
  },
});
