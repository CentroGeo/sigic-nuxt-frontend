# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**sigic-nuxt-frontend** is the web frontend for the SIGIC platform (_Sistema Integral de Gestión de Información Científica_, CentroGeo). Runs with SSR enabled on Nuxt 3 + Vue 3 + TypeScript. Authentication is handled server-side via `@sidebase/nuxt-auth` with a Keycloak OIDC provider. Modules can be toggled on/off per deployment via feature flags.

## Common Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint (with auto-fix)
npm run lint

# Format with Prettier
npm run format

# Tests
npm run test           # all tests
npm run test:unit      # unit tests only (test/unit/)
npm run test:nuxt      # nuxt integration tests (test/nuxt/)

# Full reinstall (cleans node_modules, .nuxt, .output)
npm run reinstall

# Docker (local prod-like)
docker compose -f docker-compose-local.yml up --build
```

## Architecture

### Module structure

The app is split into functional modules, each with its own `pages/`, `components/`, and Pinia `stores/` slice. Modules can be disabled via feature flags without breaking other modules.

| Módulo         | Ruta base                                          | Feature flag                   | Descripción                                       |
| -------------- | -------------------------------------------------- | ------------------------------ | ------------------------------------------------- |
| Catálogo Vista | `/catalogo/explorar`                               | `ENABLE_CATALOGO_VISTA`        | Exploración de datasets de GeoNode                |
| Catálogo Carga | `/catalogo/cargar-archivos`, `/mis-archivos`, etc. | `ENABLE_CATALOGO_CARGA` + auth | Publicación y gestión de recursos                 |
| Consulta       | `/consulta`                                        | `ENABLE_CONSULTA`              | Visualización de capas, documentos y tablas       |
| IA Asistida    | `/ia`                                              | `ENABLE_IAA` + auth            | Chat semántico con documentos (consume ia-engine) |
| Levantamiento  | `/levantamiento`                                   | `ENABLE_LEVANTAMIENTO` + auth  | Gestión de aportes y proyectos de campo           |

### Authentication

- `@sidebase/nuxt-auth` with `authjs` provider and Keycloak.
- Session strategy: **JWT** stored server-side via `server/api/auth/[...].ts`.
- Token refresh is handled automatically in the `jwt` callback when the access token expires (60s margin). Refresh token rotation is supported.
- `session.accessToken` is exposed to client code to call GeoNode and ia-engine APIs directly.
- Middleware `auth.ts` guards routes that require authentication; applied per-page via `definePageMeta`.

### Middleware

| Archivo                       | Scope          | Función                                                               |
| ----------------------------- | -------------- | --------------------------------------------------------------------- |
| `habilitar_modulos.global.ts` | global         | Bloquea rutas cuyo feature flag está desactivado (→ 404)              |
| `default-redirect.global.ts`  | global         | Redirige `/` a `NUXT_PUBLIC_DEFAULT_PAGE` si está configurado         |
| `trust-proxy.global.ts`       | global (Nitro) | Propaga headers `x-forwarded-*` en producción detrás de reverse proxy |
| `auth.ts`                     | por página     | Requiere sesión autenticada                                           |
| `redireccionar-modulo-*.js`   | por módulo     | Redirecciones internas de cada sección                                |

### Stores (Pinia)

Un store por módulo funcional en `stores/`:

- `ia.js` — estado de proyectos, contextos, chats y comunicación con ia-engine
- `catalogo.js` / `resourcesCatalogo.js` / `filteredResources.js` — datasets GeoNode para catálogo
- `consulta.js` / `resourcesConsulta.js` — recursos para la sección de consulta
- `resourcesIA.js` — recursos GeoNode usados en proyectos IA
- `levantamiento.js` — proyectos y aportes de levantamiento
- `editedMetadata.js` — edición de metadatos en flujo de publicación
- `accesibilidad.js` — preferencias de accesibilidad (temas, tamaño de fuente)

Los stores acceden al `accessToken` desde `useAuth()` para autenticar peticiones a backends externos.

### Composables

- `useGnoxyUrl.ts` — construye URLs relativas a la instancia GeoNode configurada
- `useDownloadResources.js` — lógica de descarga de recursos desde GeoNode/GeoServer
- `useGeoserverDataTable.js` — consultas WFS a GeoServer para tablas de atributos
- `useResourcesSupplements.js` — datos complementarios de recursos (miniaturas, permisos)

### Design system

- CSS base: `@centrogeomx/sisdai-css`
- Componentes UI: `@centrogeomx/sisdai-componentes`
- Mapas: `@centrogeomx/sisdai-mapas` (fork con soporte ArcGIS, instalado desde GitHub)
- Componentes propios en `components/ui/` (paginador, tablas accesibles, panel lateral)

### External services

| Variable                                              | Servicio                  | Uso                              |
| ----------------------------------------------------- | ------------------------- | -------------------------------- |
| `NUXT_PUBLIC_GEONODE_URL` / `NUXT_PUBLIC_GEONODE_API` | GeoNode (geonode-wrapper) | Catálogo, metadatos, publicación |
| `NUXT_PUBLIC_GEOSERVER_URL`                           | GeoServer                 | WMS/WFS para mapas y tablas      |
| `NUXT_PUBLIC_IA_BACKEND_URL`                          | ia-engine                 | Chat semántico, proyectos IA     |
| `KEYCLOAK_ISSUER` / `KEYCLOAK_CLIENT_*`               | Keycloak IAM              | Autenticación OIDC               |

## Environment

Copiar `env_sample` a `.env`. Variables clave:

```
NUXT_AUTH_SECRET                  # secreto JWT de NextAuth
KEYCLOAK_CLIENT_ID / _SECRET / KEYCLOAK_ISSUER  # credenciales Keycloak (server-side)
NUXT_PUBLIC_KEYCLOAK_CLIENT_ID / NUXT_PUBLIC_KEYCLOAK_ISSUER  # client-side
NUXT_PUBLIC_GEONODE_API           # endpoint API GeoNode
NUXT_PUBLIC_IA_BACKEND_URL        # endpoint ia-engine
NUXT_PUBLIC_ENABLE_*              # feature flags (true/false)
NUXT_APP_BASE_URL                 # base URL del app
```

En producción, también se requiere `NUXT_AUTH_ORIGIN` para que NextAuth genere callbacks correctos detrás del proxy.

## Code Quality

- **ESLint** + **Prettier** — pre-commit via husky.
- Prettier: `singleQuote`, `semi`, `trailingComma: 'es5'`, `tabWidth: 2`, `printWidth: 100`.
- ESLint reglas clave: `eqeqeq`, `no-unused-vars`, `prefer-const`, `no-console` (warn, excepto `console.warn/error`).
- Tests: `vitest` con dos proyectos — `unit` (env node) y `nuxt` (env happy-dom con Nuxt runtime).
