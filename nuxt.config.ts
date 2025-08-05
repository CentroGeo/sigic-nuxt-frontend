// https://nuxt.com/docs/api/configuration/nuxt-config

const isDev = process.env.NODE_ENV !== 'production';

export default defineNuxtConfig({
  app: {
    head: {
      link: [
        {
          rel: 'shortcut icon',
          href: 'https://framework-gb.cdn.gob.mx/gm/v3/assets/images/favicon.ico',
        },
        {
          rel: 'stylesheet',
          // href: 'https://framework-gb.cdn.gob.mx/gm/v3/assets/styles/main.css',
        },
      ],
      script: [
        {
          // src: 'https://framework-gb.cdn.gob.mx/gm/v3/assets/js/gobmx.js',
        },
      ],
    },
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: isDev },
  sourcemap: {
    server: isDev,
    client: isDev,
  },

  modules: [
    '@pinia/nuxt',
    // "@nuxt/content",
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@sidebase/nuxt-auth',
    '@vueuse/nuxt',
  ],

  css: ['@centrogeomx/sisdai-css/dist/sisdai.min.css'],

  auth: {
    isEnabled: true,
    baseURL: `${process.env.NUXT_PUBLIC_BASE_URL}/api/auth`,
    originEnvKey: 'NUXT_AUTH_ORIGIN',

    globalAppMiddleware: false, // protege todas las páginas por defecto
    provider: {
      type: 'authjs',
      trustHost: true,
      defaultProvider: 'keycloak',
    },
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
  },

  runtimeConfig: {
    // Variables privadas (solo disponibles en el servidor, como tokens)

    // Variables públicas (disponibles también en el cliente)
    public: {
      geonodeApi: `${process.env.GEONODE_URL}/api/v2`,
      geoserverUrl: process.env.GEOSERVER_URL,
      geonodeUrl: process.env.GEONODE_URL,

      // geoserverApi: `${process.env.GEOSERVER_URL}/rest`,
    },
  },

  nitro: {
    // TODO: remover cuando catálogo se conecte con el backend
    storage: {
      fs: {
        driver: 'fs',
        base: './public',
      },
    },
  },

  devServer: {
    // TODO: remover, solo se utiliza cuando se levanta el chat-front del módulo de IA
    // port: 3001
  },

  vite: {
    ssr: {
      noExternal: ['@centrogeomx/sisdai-mapas'],
    },
  },
});
