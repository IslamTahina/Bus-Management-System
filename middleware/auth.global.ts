export default defineNuxtRouteMiddleware((to, _from) => {
  const session = useSupabaseSession();

  if (!session.value && to.path !== "/login") {
    useUserStore().userRole = null;
    return navigateTo("/login");
  }
  else {
    useUserStore().fetchRole();
  }
 
});
