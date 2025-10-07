// https://nuxt.com/docs/api/configuration/nuxt-config

const isDev = process.env.NODE_ENV !== 'production';
const baseUrl = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const metaImg = 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg';
const metaDescription =
  'Sistema Integral de Gestión de Información Científica. Integra, visualiza y aprovecha el conocimiento científico de México.';

export default defineNuxtConfig({
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/sigic/',
    head: {
      link: [
        {
          rel: 'shortcut icon',
          href: 'https://framework-gb.cdn.gob.mx/gm/v3/assets/images/favicon.ico',
        },
      ],
      meta: [
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: 'SIGIC' },
        {
          property: 'og:description',
          content: metaDescription,
        },
        {
          property: 'og:image',
          content: metaImg,
        },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'SIGIC' },
        {
          name: 'twitter:description',
          content: metaDescription,
        },
        {
          name: 'twitter:image',
          content: metaImg,
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
    baseURL: `${baseUrl || 'http://localhost:3000'}/api/auth`,
    globalAppMiddleware: false,
    provider: {
      type: 'authjs',
      trustHost: true,
      defaultProvider: 'keycloak',
    },
    sessionRefresh: {
      enablePeriodically: 300000,
      enableOnWindowFocus: true,
    },
  },

  runtimeConfig: {
    // Variables privadas (solo disponibles en el servidor, como tokens)

    // Variables públicas (disponibles también en el cliente)
    public: {
      apiBase: `${process.env.NUXT_APP_BASE_URL || '/'}api`,
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      geonodeUrl: process.env.NUXT_PUBLIC_GEONODE_URL,
      geonodeApi: process.env.NUXT_PUBLIC_GEONODE_API,
      geoserverUrl: process.env.NUXT_PUBLIC_GEOSERVER_URL,
      iaBackendUrl: process.env.NUXT_PUBLIC_IA_BACKEND_URL,
      defaultPage: process.env.NUXT_PUBLIC_DEFAULT_PAGE,
      geonodeApiDefaultFilter: process.env.NUXT_PUBLIC_GEONODE_API_DEFAULT_FILTER || '',
      enableAuth: process.env.NUXT_PUBLIC_ENABLE_AUTH === 'true' || true,
      enableCatalogoVista: process.env.NUXT_PUBLIC_ENABLE_CATALOGO_VISTA === 'true' || true,
      enableCatalogoCarga: process.env.NUXT_PUBLIC_ENABLE_CATALOGO_CARGA === 'true' || true,
      enableConsulta: process.env.NUXT_PUBLIC_ENABLE_CONSULTA === 'true' || true,
      enableIaa: process.env.NUXT_PUBLIC_ENABLE_IAA === 'true' || true,
    },
  },

  nitro: {
    baseURL: process.env.NITRO_APP_BASE_URL || '/sigic/',
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
      noExternal: ['@centrogeomx/sisdai-mapas', 'ol-displaced-points', 'circle-properties'],
    },
  },
});
