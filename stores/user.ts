export const useUserStore = defineStore("users", {
  state: () => ({
    user: null,
    isLoading: false,
    error: null,
  }),
  actions: {},
});
