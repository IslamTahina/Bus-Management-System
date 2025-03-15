// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    'nuxt-icon'
  ],

  css: ['~/assets/css/main.css'],

  ui: {
    icons: ['ph', 'logos']
  },

  tailwindcss: {
    config: {
      content: [],
      theme: {
        extend: {
          colors: {
            primary: '#E8F3D6'
          }
        }
      }
    }
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27'
})