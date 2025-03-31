export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/driver')) {
    to.meta.layout = 'driver'
  }
}) 