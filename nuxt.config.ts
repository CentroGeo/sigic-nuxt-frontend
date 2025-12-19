// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

const isDev = process.env.NODE_ENV !== 'production';
const appBasePath = process.env.NUXT_PUBLIC_APP_BASE_PATH || '/';
const basePath = appBasePath.replace(/\/+$/, '');
const authBaseUrl = process.env.NUXT_PUBLIC_AUTH_BASE_URL;
const originEnvKey = isDev ? undefined : 'NUXT_AUTH_ORIGIN';

const metaImg = 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg';
const metaDescription =
  'Sistema Integral de Gestión de Información Científica. Integra, visualiza y aprovecha el conocimiento científico de México.';

export default defineNuxtConfig({
  app: {
    baseURL: appBasePath,
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

  nitro: {
    baseURL: appBasePath,
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
    baseURL: authBaseUrl,
    originEnvKey: originEnvKey,
    basePath: appBasePath,
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
    keycloakClientId: process.env.KEYCLOAK_CLIENT_ID,
    keycloakIssuer: process.env.KEYCLOAK_ISSUER,
    keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET,

    // Variables públicas (disponibles en el cliente)
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      basePath: basePath,
      ollamaModel: process.env.NUXT_PUBLIC_OLLAMA_MODEL || 'deepseek-r1',
      geonodeUrl: process.env.NUXT_PUBLIC_GEONODE_URL || 'https://geonode.dev.geoint.mx',
      geonodeApi: process.env.NUXT_PUBLIC_GEONODE_API || 'https://geonode.dev.geoint.mx/api/v2',
      geoserverUrl:
        process.env.NUXT_PUBLIC_GEOSERVER_URL || 'https://geonode.dev.geoint.mx/geoserver',
      iaBackendUrl: process.env.NUXT_PUBLIC_IA_BACKEND_URL || 'https://sigic.ia.dev.geoint.mx/llmb',
      defaultPage: process.env.NUXT_PUBLIC_DEFAULT_PAGE || '/',
      geonodeApiDefaultFilter: process.env.NUXT_PUBLIC_GEONODE_API_DEFAULT_FILTER || '',
      enableAuth: process.env.NUXT_PUBLIC_ENABLE_AUTH === 'true',
      enableCatalogoVista: process.env.NUXT_PUBLIC_ENABLE_CATALOGO_VISTA === 'true',
      enableCatalogoCarga: process.env.NUXT_PUBLIC_ENABLE_CATALOGO_CARGA === 'true',
      enableConsulta: process.env.NUXT_PUBLIC_ENABLE_CONSULTA === 'true',
      enableIaa: process.env.NUXT_PUBLIC_ENABLE_IAA === 'true',
      enableLevantamiento: process.env.NUXT_PUBLIC_ENABLE_LEVANTAMIENTO === 'true',
    },
  },

  vite: {
    ssr: {
      noExternal: ['@centrogeomx/sisdai-mapas', 'ol-displaced-points', 'circle-properties'],
    },
  },
});
