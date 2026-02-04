# sigic-nuxt-sisdai

## Requerimientos para correr esta aplicación

Tecnologías requeridas:

- [node.js](https://nodejs.org/) versión 22 o superior
- [npm](https://www.npmjs.com/) versión 10 o superior

### Principales dependencias

El front-end de este proyecto está hecho con [Nuxt](https://nuxt.com/docs/getting-started/introduction) y como sistema de diseño usa el [SISDAI](https://sisdai.conahcyt.mx/).

Para consultar más información de SISDAI y su estado actual se recomienda revisar los repositorios:

- [sisdai-mapas](https://github.com/CentroGeo/sisdai-mapas)
- [sisdai-componentes](https://github.com/CentroGeo/sisdai-componentes)
- [sisdai-css](https://github.com/CentroGeo/sisdai-css)
- [sisdai-graficas](https://github.com/CentroGeo/sisdai-graficas)

### Configuración

Instalación de dependencias:

```bash
# npm
npm install

```

### Levantar en servidor local

Levantar el proyecto en un servidor local `http://localhost:3000`:

```bash
# npm
npm run dev


```

### Compilar para producción

Para generar el código para producción:

```bash
# npm
npm run build

```

Vista previa del proyecto en producción

```bash
# npm
npm run preview

```

### Reinstalar dependencias

```bash
# borra el package-lock.json, la carpeta node_modules y vuelve a instalar todas las dependencias
npm run reinstall
```

###  Estructura del proyecto

Uno de los beneficios de Nuxt es que la estructura de navegación de la aplicación web se genera a partir de la estructura que se le den a las vistas en la carpeta `pages`. La estructura es la siguiente:

```bash
.
├── catalogo  # Este módulo permite cargar documentos, editar metadatos y previsualizarlos
│   ├── cargar-archivos.vue
│   ├── explorar
│   │   ├── capas.vue
│   │   ├── catalogos-externos.vue
│   │   ├── documentos.vue
│   │   ├── index.vue
│   │   └── tablas.vue
│   ├── mis-archivos
│   │   ├── editar
│   │   │   ├── AtributosConjunto.vue
│   │   │   ├── estilo.vue
│   │   │   ├── MetadatosBasicos.vue
│   │   │   ├── MetadatosOpcionales.vue
│   │   │   └── UbicacionLicencias.vue
│   │   ├── index.vue
│   │   ├── metadatos-pendientes.vue
│   │   ├── solicitudes-publicacion.vue
│   │   └── unir-vectores.vue
│   ├── revision-solicitudes
│   │   ├── aceptadas.vue
│   │   ├── index.vue
│   │   ├── mis-revisiones.vue
│   │   ├── no-aceptadas.vue
│   │   ├── pendientes-revisor.vue
│   │   └── revisar
│   │       └── [id].vue
│   └── servicios-remotos
│       ├── [id].vue
│       ├── agregar.vue
│       ├── cargados.vue
│       ├── importar.vue
│       └── index.vue
├── catalogo.vue
├── consulta # Este módulo permite visualizar los archivos publicos y cargados por la persona usuaria
│   ├── capas.vue
│   ├── documentos.vue
│   └── tablas.vue
├── consulta.vue
├── ia # Módulo para crear proyectos y chats de IA
│   ├── chat
│   │   └── dinamica.vue
│   ├── chats.vue
│   ├── proyecto
│   │   ├── [id].vue
│   │   └── contexto
│   │       └── [id].vue
│   └── proyectos.vue
├── ia.vue
├── index.vue # Página de inicio del proyecto
├── levantamiento # Módulo para levantar datos geoespaciales
│   ├── aportes
│   │   ├── editar
│   │   │   └── [id].vue
│   │   ├── en-revision.vue
│   │   ├── index.vue
│   │   ├── por-enviar.vue
│   │   ├── por-modificar.vue
│   │   └── rechazados.vue
│   ├── descargas
│   │   ├── index.vue
│   │   ├── rechazadas
│   │   │   └── index.vue
│   │   └── revision
│   │       └── index.vue
│   └── proyectos
│       ├── index.vue
│       ├── mis-proyectos
│       │   ├── [id]
│       │   │   ├── formulario.vue
│       │   │   ├── index.vue
│       │   │   ├── informacion-general.vue
│       │   │   └── participantes-permisos.vue
│       │   └── index.vue
│       ├── proyecto
│       │   └── [id].vue
│       └── proyectos-compartidos.vue
├── levantamiento.vue
├── mi-cuenta # Módulo para ver y modificar datos de la cuenta
│   ├── informacion-personal.vue
│   ├── produccion-colaboraciones.vue
│   └── seguridad.vue
└── mi-cuenta.vue

```

## Variables de entorno (.env)

Las variables que debe incluir el archivo .env deben ser nombradas como sigue

```bash

# Api del geonode fuente del catálogo
NUXT_PUBLIC_GEONODE_API = <geonode api de producción>
# Url del geonode fuente del catálogo
NUXT_PUBLIC_GEONODE_URL = <geonode url de producción>
# Url del geoserver fuente de capas geográficas
NUXT_PUBLIC_GEOSERVER_URL = <geoserver url de producción>
# URL de autenticación
NUXT_PUBLIC_AUTH_BASE_URL=http://localhost:3000/api/auth

# ID del cliente de autenticación
KEYCLOAK_CLIENT_ID = <Id client>
KEYCLOAK_ISSUER = <keycloak de produccón>
# Clave secreta del servicio de autenticación
KEYCLOAK_CLIENT_SECRET = <Clave secreta>
NUXT_AUTH_SECRET = <clave alfanumérica>
# Url del proyecto sigic
NUXT_PUBLIC_BASE_URL = <sigic url de producción>
# URL del backend de IA
NUXT_PUBLIC_IA_BACKEND_URL = <ulr del back de IA>

# URL del backend de Levantamiento
NUXT_PUBLIC_LEVANTAMIENTO_URL = <ulr del back de levantamiento>


# Indica la ruta base del proyecto
NUXT_PUBLIC_APP_BASE_PATH=/

# Las siguientes variables habilitan o desahbilitan las vistas de
# autenticación, catálogo, consulta, IA y levantamiento
NUXT_PUBLIC_ENABLE_AUTH = true
NUXT_PUBLIC_ENABLE_CATALOGO_VISTA = true
NUXT_PUBLIC_ENABLE_CATALOGO_CARGA = true
NUXT_PUBLIC_ENABLE_CONSULTA = true
NUXT_PUBLIC_ENABLE_IAA = true
NUXT_PUBLIC_ENABLE_LEVANTAMIENTO = true
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
