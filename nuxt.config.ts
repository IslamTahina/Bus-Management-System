// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxt/ui",
    "@nuxtjs/supabase",
    '@nuxt/icon',
    // "@vite-pwa/nuxt",
    "@pinia/nuxt",
  ],

  supabase: {
    redirect: false,
  },
  css: ['~/assets/css/main.css'],
  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: "2025-03-29",
});