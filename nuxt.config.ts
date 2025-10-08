// https://nuxt.com/docs/api/configuration/nuxt-config

const isDev = process.env.NODE_ENV !== 'production';
const appBase = (process.env.NUXT_APP_BASE_URL || '/').replace(/\/+$/, '/');
const publicBase = process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// 🔹 Combina dominio + subpath
const fullBase = `${publicBase}${appBase.replace(/\/$/, '')}`;

const metaImg = 'https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/nilo.jpg';
const metaDescription =
  'Sistema Integral de Gestión de Información Científica. Integra, visualiza y aprovecha el conocimiento científico de México.';

export default defineNuxtConfig({
  app: {
    baseURL: appBase,
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
    baseURL: appBase,
    // TODO: remover cuando catálogo se conecte con el backend
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
    debug: true,
    isEnabled: true,
    baseURL: `${fullBase}/api/auth`,
    originEnvKey: isDev ? undefined : 'NUXT_PUBLIC_BASE_URL',
    globalAppMiddleware: false,
    provider: {
      type: 'authjs',
      trustHost: true,
      defaultProvider: 'keycloak',
    },
    useSecureCookies: !isDev,
    sessionRefresh: {
      enablePeriodically: 300000,
      enableOnWindowFocus: true,
    },
    cookies: {
      state: {
        name: 'next-auth.state',
        options: {
          httpOnly: true,
          sameSite: isDev ? 'lax' : 'none',
          secure: !isDev,
          path: '/',
        },
      },
    },
  },

  runtimeConfig: {
    // Variables privadas (solo disponibles en el servidor, como tokens)
    // authOrigin: process.env.NUXT_AUTH_ORIGIN,
    authSecret: process.env.NUXT_AUTH_SECRET,
    keycloakClientId: process.env.KEYCLOAK_CLIENT_ID,
    keycloakIssuer: process.env.KEYCLOAK_ISSUER,
    keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET,

    // Variables públicas (disponibles también en el cliente)
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL,
      geonodeUrl: process.env.NUXT_PUBLIC_GEONODE_URL,
      geonodeApi: process.env.NUXT_PUBLIC_GEONODE_API,
      geoserverUrl: process.env.NUXT_PUBLIC_GEOSERVER_URL,
      iaBackendUrl: process.env.NUXT_PUBLIC_IA_BACKEND_URL,
      defaultPage: process.env.NUXT_PUBLIC_DEFAULT_PAGE,
      geonodeApiDefaultFilter: process.env.NUXT_PUBLIC_GEONODE_API_DEFAULT_FILTER || '',
      enableAuth: process.env.NUXT_PUBLIC_ENABLE_AUTH === 'true',
      enableCatalogoVista: process.env.NUXT_PUBLIC_ENABLE_CATALOGO_VISTA === 'true',
      enableCatalogoCarga: process.env.NUXT_PUBLIC_ENABLE_CATALOGO_CARGA === 'true',
      enableConsulta: process.env.NUXT_PUBLIC_ENABLE_CONSULTA === 'true',
      enableIaa: process.env.NUXT_PUBLIC_ENABLE_IAA === 'true',
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
