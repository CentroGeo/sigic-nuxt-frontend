# Changelog

Todos los cambios más importantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0)
y este proyecto se adhiere al [Versionamiento semántico](https://semver.org/spec/v2.0.0.html).

\*Nota: Este Changelog se comenzó el 2025-12-29, cuando el sistema llevaba un avance considerable.

## [0.9.4] - 10-02-2026

### Arreglado (Fix)

- Se añadieron keycloakIssuer y keycloakClientId a la configuración pública de runtime en nuxt.config.ts
- Se modificó el flujo de cierre de sesión en pages/mi-cuenta.vue para primero cerrar la sesión localmente y luego redirigir al usuario al endpoint de logout de Keycloak con los parámetros requeridos (id_token_hint y client_id).
- Se extendió el objeto de sesión en server/api/auth/[...].ts para incluir idToken, permitiendo que el flujo de cierre de sesión proporcione a Keycloak la pista de token necesaria (id_token_hint).

## [0.9.3] - 10-02-2026

### Arreglado (Fix)

- Se agregó `NUXT_APP_BASE_URL` como argumento de tiempo de compilación y como variable de entorno en el `Dockerfile`, tanto en la etapa de construcción como en la de ejecución, asegurando que la URL base esté explícitamente definida y disponible durante la compilación y en tiempo de ejecución.
- Se actualizó `nuxt.config.ts` para usar `NUXT_APP_BASE_URL` (en lugar de `NUXT_PUBLIC_APP_BASE_PATH`) al establecer `appBasePath`, que ahora es la fuente principal de la URL base de la aplicación.
- Se modificó la configuración pública en tiempo de ejecución para usar `NUXT_APP_BASE_URL` en `basePath`, garantizando que el cliente reciba la ruta base correcta.
- Se habilitó el renderizado del lado del servidor (`ssr: true`) en la configuración de Nuxt y se estableció el `baseURL` de la aplicación Nuxt para que utilice el nuevo `appBasePath`.
- Se actualizó la configuración del servidor Nitro para usar `appBasePath` como su `baseURL`, se estableció el `preset` en `node-server` y se deshabilitó la compresión de los assets públicos para lograr un comportamiento del servidor más predecible.

## [0.9.2] - 09-02-2026

### Arreglado (Fix)

- Se hicieron ajustes para que la sección de servicios remotos dirija automáticamente a la sección de servicios remotos sugeridos cuando no se ha iniciado sesión.
- En las tarjetas de los catálogos remotos sugeridos, se cambió el botón de Importar recursos por Registrar Servicio. Este aparece deshabilitado en caso de que no se haya iniciado sesión y, cuando sí se ha iniciado sesión, redirije a la sección de registro de servicios remotos y se autocompletan los campos.
- Se implementó un modal con información extra. Este se abre al hacer clic en Más Información en las tarjetas de catálogos externos sugeridos.

## [0.9.1] - 06-02-2026

### Arreglado (Fix)

- Se mejoró el manejo de errores de las funciones para solicitar geometrías, tablas, etc.
- Se agregó un botón para reintentar la petición de recursos en consulta cuando esta falla.

## [0.9.0] - 05-02-2026

### Agregado (Added)

- Se agregan las rutas para la sección de revisor en el módulo de levantamiento

## [0.8.1] - 05-02-2026

### Arreglado (Fix)

- Se resuelve un bug que hacía que se marcara como cargado un documento antes de obtener la información necesaria para construir todos los elementos de la tarjeta.
- Se agrega manejo de errores en la función que revisa si un servidor arcgis tiene FeatureServer.
- Se reactiva la función de seleccionar visualizar una capa de un servidor arcgis únicamente en un lado de una capa.

## [0.8.0] - 04-02-2026

### Agregado (Added)

- Se agrega la funcionalidad de agregar archivos desde el catálogo de geonode al módulo de IA.

## [0.7.2] - 30-01-2026

### Arreglado (Fix)

- Se actualiza el dockerfile con el comando `--legacy-peer-deps` al instalar las dependencias para resolver el problema del despliegue.

## [0.7.1] - 29-01-2026

### Arreglado (Fix)

- Se atendió el bug que ocurría al solicitar mis-solicitudes cuando se navegaba a catálogo desde consulta.
- Se atendió el bug de redireccionamiento de las solicitudes a consutla.
- Se atendió el bug que congelaba la pantalla al navegar del modal que indica que se había creado exitosamente la solicitud a la vista de mis-solicitudes.
- Se creó una función para obtener la extensión de un recurso y mostrarla en el modal de creación exitosa de solicitud.
- Se atendió el bug que generaba un tipo espejo en la vista de revisión de solicitud para documentos.
- Se agregó soporte para capas remotas y servicios arcgis en la vista de revisión de solicitud para capas.
- Se implementó el uso del endpoint /api/v2/services/ al eliminar un recurso de un servidor externo.
- Se modificó el consumo de filtros para las vistas de revisión de metadatos

## [0.7.0] - 28-01-2026

### Agregado (Added)

- En el módulo de levantamiento se agregó la conexión con la API de la sección de proyectos. Esta integración incluye la creación y configuración de proyectos, así como la visualización de proyectos públicos y compartidos.

## [0.6.1] - 28-01-2026

### Arreglado (Fix)

- Ahora se pueden crear dos servicios que apunten a la misma url siempre y cuando sean dos personas usuarias distintas quienes las registran.
- Se agregó redireccionamiento al login en la vista de explorar/servicios-remotos
- Los servicios registrados que aparecen son los que la persona usuaria registró, incluso para superusuarios.

## [0.6.0] - 28-01-2026

### Agregado (Added)

- Se habilito la edición de información personal y avatar

## [0.5.0] - 27-01-2026

### Agregado (Added)

- En el módulo de catálogo se agregó la funcionalidad de agregar solicitudes de publicación.

## [0.4.1] - 26-01-2026

### Arreglado (Fix)

- Se arregló un bug en la petición de recursos para la sección de Mis Archivos. Este bug impedía solicitar documentos y datasets al mismo tiempo.

## [0.4.0] - 23-01-2026

### Agregado (Added)

- En el módulo de consulta se agregó la posibilidad de visualizar capas de servicios remotos tipo ArcGIS. También se agregó la funcionalidad de consultar el tipo de geometría de las mismas, así como sus tablas de antributos cuando estas están disponibles.

## [0.3.0] - 22-01-2026

### Agregado (Added)

- En el módulo de levantamiento se comenzó la conexión de con la API en la sección de descargas. Hasta ahora permite solicitar descargas y eliminar descargas en revisión.

## [0.2.3] - 22-01-2026

### Arreglado (Fix)

- Se arregló un bug en la carga de archivos slds que tenía que ver con la forma en la que se iteraba sobre los archivos cargados.

## [0.2.2] - 08-01-2026

### Arreglado (Fix)

- Se ajustó el color del fondo de las tablas del módulo de consulta pues se perdía el texto en el modo oscuro
- Se ajustó el estilo de algunos spinners de los módulos de consulta y catálogo porque se perdían en modo oscuro
- Se ajustó el consumo de recursos a 10 por vez en el módulo de consulta
- Se ajustó el estilo del titulo de los recursos en los modales del módulo de consulta para que no apareciera un scroll lateral
- Se cambió la imagen que aparece al compartir el recurso por el icono del SIGIC

## [0.2.1] - 06-01-2026

### Arreglado (Fix)

- Se resolvió un bug en el drag and drop en el que se buscador de archivos y cerraba tres veces antes de poder subir.

## [0.2.0] - 29-12-2025

### Agregado (Added)

- Se agregó documentación e instrucciones en README sobre prácticas de desarrollo colaborativo en el sistema para documentar y versionar.
- Se creo este archivo

## [0.1.0] - 26-12-2025

### Agregado (Added)

- Se consultan estilos asociados a una capa para mostrar el numero de estilos asociados en una capa en las tarjetas del catálogo (para capas locales y remotos ogc)
- Se agrega un selector de estilos asociados en la capa en la tarjeta de archivo seleccionado (para capas locales y remotos ogc)
- Se agrega un selector de estilos asociados en el modal de previsualización de capas (para capas locales pues ningún remoto aparece en la sección de tablas)

## [0.0.2] - 26-12-2025

### Arreglado (Fix)

- Al cargar un archivo desde el módulo de catálogo, la alerta de éxito ya no ofrece la opción de Ver en Mis Archivos

## [0.0.1] - 19-12-2025 - Release

### Primer versionamiento del sistema

[0.9.4]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.9.3...v0.9.4
[0.9.3]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.8.0...v0.8.1
[0.7.2]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.7.2...v0.8.0
[0.7.2]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.2.3...v0.3.0
[0.2.3]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/releases/tag/v0.0.1
