// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },

  modules: [
<<<<<<< HEAD
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/test-utils',
    '@nuxt/image',
    '@sidebase/nuxt-auth'
  ]
=======
    '@pinia/nuxt',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils'
  ],

  css: [
    '@centrogeomx/sisdai-css/dist/sisdai.min.css',
  ],
>>>>>>> feature/nuxt3
})