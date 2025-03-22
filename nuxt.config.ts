// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    'nuxt-icon'
  ],

  css: ['~/assets/css/main.css'],
  ui:{
    colorMode: true
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27'
})