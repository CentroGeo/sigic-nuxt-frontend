# sigic-nuxt-sisdai

## Requerimientos para correr esta aplicación

Tecnologías requeridas:

- [node.js](https://nodejs.org/) versión 22 o superior
- [npm](https://www.npmjs.com/) versión 10 o superior

## Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

### Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Licencia

## Variables de entorno (.env)

Las variables que debe incluir el archivo .env deben ser nombradas como sigue

```bash
# Url del geonode fuente del catálogo
GEONODE_URL = https://geonode.dev.geoint.mx
# Api del geonode para usar endpoints
GEONODE_API = /api/v2
# Url del geoserver fuente de capas geográficas
GEOSERVER_URL = https://geonode.dev.geoint.mx/geoserver
# Api del geoserver para usar endpoints (puede servir para subir estilos sld directos al geoserver - requiere autenticación)
GEOSERVER_API = /rest

# ID del cliente de autenticación
KEYCLOAK_CLIENT_ID = sigic-nuxt-dev
#
KEYCLOAK_ISSUER = https://iam.dev.geoint.mx/realms/sigic
#
KEYCLOAK_CLIENT_SECRET = <Clave secreta>
```
