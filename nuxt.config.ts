// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

const isDev = process.env.NODE_ENV !== 'production';
const originEnvKey = isDev ? undefined : 'NUXT_AUTH_ORIGIN';

const metaImg = process.env.NUXT_APP_BASE_URL + 'img/icono_sigic.png';
const metaTitle = 'SIGIC | Sistema Integral de Gestión de Información Científica';
const metaDescription =
  'Sistema Integral de Gestión de Información Científica. Integra, visualiza y aprovecha el conocimiento científico de México.';

export default defineNuxtConfig({
  ssr: true,

  app: {
    baseURL: '/',
    head: {
      htmlAttrs: {
        lang: 'es-MX',
      },

      title: metaTitle,
      link: [
        {
          rel: 'shortcut icon',
          href: 'https://framework-gb.cdn.gob.mx/gm/v3/assets/images/favicon.ico',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
          crossorigin: 'anonymous',
        },
      ],
      meta: [
        { name: 'description', content: metaDescription },

        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: metaTitle },
        {
          property: 'og:description',
          content: metaDescription,
        },
        {
          property: 'og:image',
          content: metaImg,
        },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: metaTitle },
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

  nitro: {
    baseURL: '/',
    preset: 'node-server',
    compressPublicAssets: false,
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@sidebase/nuxt-auth',
    '@vueuse/nuxt',
  ],

  css: ['@centrogeomx/sisdai-css/dist/sisdai.min.css'],

  auth: {
    debug: !isDev,
    isEnabled: true,
    baseURL: '/',
    originEnvKey: originEnvKey,
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
    // Variables privadas (solo disponibles en el servidor)
    authSecret: process.env.NUXT_AUTH_SECRET,
    keycloakClientId: process.env.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID,
    keycloakIssuer: process.env.NUXT_PUBLIC_KEYCLOAK_ISSUER,
    keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET,

    // Variables públicas (disponibles en el cliente)
    public: {
      keycloakIssuer: process.env.NUXT_PUBLIC_KEYCLOAK_ISSUER,
      keycloakClientId: process.env.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID,
      ollamaModel: process.env.NUXT_PUBLIC_OLLAMA_MODEL || 'deepseek-r1',
      geonodeUrl: process.env.NUXT_PUBLIC_GEONODE_URL || 'https://geonode.dev.geoint.mx',
      geonodeApi: process.env.NUXT_PUBLIC_GEONODE_API || 'https://geonode.dev.geoint.mx/api/v2',
      geoserverUrl:
        process.env.NUXT_PUBLIC_GEOSERVER_URL || 'https://geonode.dev.geoint.mx/geoserver',
      iaBackendUrl: process.env.NUXT_PUBLIC_IA_BACKEND_URL || 'https://sigic.ia.dev.geoint.mx/llmb',
      levantamientoBackendUrl: process.env.NUXT_PUBLIC_LEVANTAMIENTO_BACKEND_URL,
      baseURL: process.env.NUXT_PUBLIC_BASE_URL,
      defaultPage: process.env.NUXT_PUBLIC_DEFAULT_PAGE || '/',
      geonodeApiDefaultFilter: process.env.NUXT_PUBLIC_GEONODE_API_DEFAULT_FILTER || '',
      enableAuth: process.env.NUXT_PUBLIC_ENABLE_AUTH === 'true',
      enableCatalogoVista: process.env.NUXT_PUBLIC_ENABLE_CATALOGO_VISTA === 'true',
      enableCatalogoCarga: process.env.NUXT_PUBLIC_ENABLE_CATALOGO_CARGA === 'true',
      enableConsulta: process.env.NUXT_PUBLIC_ENABLE_CONSULTA === 'true',
      enableIaa: process.env.NUXT_PUBLIC_ENABLE_IAA === 'true',
      enableLevantamiento: process.env.NUXT_PUBLIC_ENABLE_LEVANTAMIENTO === 'true',
      enableAcercaDe: process.env.NUXT_PUBLIC_ENABLE_ACERCA_DE === 'true',
      enableGeocontenidos: process.env.NUXT_PUBLIC_ENABLE_GEOCONTENIDOS === 'true',
      enableGeohistorias: process.env.NUXT_PUBLIC_ENABLE_GEOHISTORIAS === 'true',
      enableTableros: process.env.NUXT_PUBLIC_ENABLE_TABLEROS === 'true',
    },
  },

  vite: {
    ssr: {
      noExternal: [
        '@centrogeomx/sisdai-mapas',
        'ol-displaced-points',
        'circle-properties',
        'echarts',
        'vue-echarts',
        'resize-detector',
      ],
    },
  },
});
