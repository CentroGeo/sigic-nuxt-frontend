// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  modules: [
    "@pinia/nuxt",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@sidebase/nuxt-auth",
  ],
  css: ["@centrogeomx/sisdai-css/dist/sisdai.min.css"],
  auth: {
    isEnabled: true,
    baseURL: "/api/auth",
    globalAppMiddleware: false, // protege todas las páginas por defecto
    provider: {
      type: "authjs",
      trustHost: true,
      defaultProvider: "keycloak",
    },
  },
});