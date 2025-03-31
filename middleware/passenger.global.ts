export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/passenger')) {
    to.meta.layout = 'passenger'
  }
}) 