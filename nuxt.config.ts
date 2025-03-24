// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    'nuxt-icon',
    '@vite-pwa/nuxt'
  ],

  css: ['~/assets/css/main.css'],
  ui:{
    colorMode: true
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  pwa: {
    manifest: {
      name: 'Bus Booking System',
      short_name: 'BusBook',
      description: 'A modern bus booking and tracking system',
      theme_color: '#000000',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  }
})