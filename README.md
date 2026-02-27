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
# Api del geonode fuente del catálogo
NUXT_PUBLIC_GEONODE_API = https://geonode.dev.geoint.mx/api/v2
# Url del geonode fuente del catálogo
NUXT_PUBLIC_GEONODE_URL = https://geonode.dev.geoint.mx
# Url del geoserver fuente de capas geográficas
NUXT_PUBLIC_GEOSERVER_URL = https://geonode.dev.geoint.mx/geoserver

# ID del cliente de autenticación
KEYCLOAK_CLIENT_ID = <Id client>
KEYCLOAK_ISSUER = https://iam.dev.geoint.mx/realms/sigic
# Clave secreta del servicio de autenticación
KEYCLOAK_CLIENT_SECRET = <Clave secreta>
NUXT_AUTH_SECRET = <clave alfanumérica definida por la persona desarrolladora>
NUXT_PUBLIC_IA_BACKEND_URL = https://sigic.ia.dev.geoint.mx/


NUXT_PUBLIC_KEYCLOAK_ISSUER = <https://iam.dev.geoint.mx/realms/sigic>
NUXT_PUBLIC_KEYCLOAK_CLIENT_ID = <Clave secreta>
NUXT_PUBLIC_KEYCLOAK_IDPS = <Diccionario de los idps de keycloak escrito como cadena>

```

Para el despliegue en producción se debe hacer un archivo `.env.production`

```bash
# Api del geonode fuente del catálogo
NUXT_PUBLIC_GEONODE_API = <geonode api de producción>
# Url del geonode fuente del catálogo
NUXT_PUBLIC_GEONODE_URL = <geonode url de producción>
# Url del geoserver fuente de capas geográficas
NUXT_PUBLIC_GEOSERVER_URL = <geoserver url de producción>

# ID del cliente de autenticación
KEYCLOAK_CLIENT_ID = <Id client>
KEYCLOAK_ISSUER = <keycloak de produccón>
# Clave secreta del servicio de autenticación
KEYCLOAK_CLIENT_SECRET = <Clave secreta>
NUXT_AUTH_SECRET = <clave alfanumérica>
# Url del proyecto sigic
NUXT_PUBLIC_BASE_URL = <sigic url de producción>
NUXT_PUBLIC_IA_BACKEND_URL = <ulr del back de IA>


NUXT_PUBLIC_KEYCLOAK_ISSUER = <https://iam.dev.geoint.mx/realms/sigic>
NUXT_PUBLIC_KEYCLOAK_CLIENT_ID = <Clave secreta>
NUXT_PUBLIC_KEYCLOAK_IDPS = <Diccionario de los idps de keycloak escrito como cadena>
NUXT_PUBLIC_DEFAULT_PAGE = <Página de inicio por defecto>
NUXT_APP_BASE_URL = <sigic url de producción>
NUXT_PUBLIC_OLLAMA_MODEL = <Nombre del modelo de ollama a usar en producción>

```

##  Cómo contribuir al SIGIC

El flujo de desarrollo colaborativo de este proyecto está basado en [gitflow](https://nvie.com/posts/a-successful-git-branching-model/) con algunas adaptaciones. El nombrado de ramas es importante, pues nos funciona para determinar que timpo de incremento se debe hacer en cada contribución, y usamos los prefijos:

- `feature/`: Cuando estamos implementando una nueva característica del sistema al desarrollo de la rama `develop`.
- `fix/`: Cuando estamos resolviendo algún _bug_ del sistema en la rama `develop`.
- `hotfix/`: Si estamos resolviendo algún _bug_ del sistema a partir de la rama `main`.

La convensión de versionamiento que usamos es el [semántico 2.0.0.](https://semver.org/lang/es/), y los incrementos de versión se llevan a cabo por parte de la persona revisora con [npm-version](https://docs.npmjs.com/cli/v8/commands/npm-version).

En el archivo CHANGELOG.md la persona que hace la contribución debe documentar cuales son los cambios que está llevando a cabo en un lenguaje accesible, en español y escrito por sí mismx (no con IA) para que todo el equipo tenga claro los cambios. Si hay alguna actualización de algúna versión de dependendencia debe mencionarse también, y esta descripción puede usarse para el _Pull request_.

En resumen, el flujo que sigue una contribución a `develop` es el siguiente:

1. La persona que hace la contribución crea una rama a partir de `develop` con el prefijo `feature/` o `fix/` concatenado con un nombre breve y descriptivo de la nueva característica o el _bug_ según sea el caso.
2. En dicha rama hace su contribución con _commits_ con mensajes claros, y al terminar actualiza el archivo CHANGELOG.md especificando de forma breve, pero clara, cual es el cambio en el sistema. Además documenta en el mismo archivo cual es la versión a la que la persona revisora debe hacer el incremento según el tipo de contribución.
3. La persona que hace la contibución sube sus cambios y cuando está listx, hace un _pull request_ a `develop`.
4. La persona revisora debe hacer pruebas en local, revisar la documentación en CHANGELOG.md y cuando esté aprobado el código debe hacer el _merge_ a `develop`
5. Una vez que la rama se unió a `develop` debe jalar cambios a su rama local, hacer el aumento de versión correspondiente con `npm version minor` o `npm version patch` según sea el caso (solo en casos muy particulares será de algún otro tipo, como `major`).
6. Finalmente la persona revisora sube a `develop` su rama local con el aumento de versión, y los tags con `git push origin --tags`.
