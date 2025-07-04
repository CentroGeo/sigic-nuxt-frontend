// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  modules: [
    "@pinia/nuxt",
    // "@nuxt/content",
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

  runtimeConfig: {
    // Variables privadas (solo disponibles en el servidor, como tokens)

    // Variables públicas (disponibles también en el cliente)
    public: {
      geonodeApi: `${process.env.GEONODE_URL}/api/v2`,
      geoserverUrl: process.env.GEOSERVER_URL,
      // geoserverApi: `${process.env.GEOSERVER_URL}/rest`,
    }
  },
  devServer: {
    // port: 3001
  },
  vite: {
    server: {
      host: '0.0.0.0',  // para aceptar conexiones externas
      port: 3000,       // el puerto que uses para dev server
      hmr: {
        host: 'sigic.dev.geoint.mx',  // dominio visible desde navegador
        protocol: 'wss',              // protocolo seguro para WebSocket
        port: 443,                    // puerto que usa https (443)
      },
    },
  },
});
