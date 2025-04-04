export default defineNuxtRouteMiddleware((to, _from) => {
  const session = useSupabaseSession();

  if (!session.value && to.path !== "/login" && to.path !== "/register") {
    debugger;
    useUserStore().userRole = null;
    return navigateTo("/login");
  }
  else {
    useUserStore().fetchRole();
  }
 
});
