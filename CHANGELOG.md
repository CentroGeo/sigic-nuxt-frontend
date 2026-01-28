# Changelog

Todos los cambios más importantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0)
y este proyecto se adhiere al [Versionamiento semántico](https://semver.org/spec/v2.0.0.html).

\*Nota: Este Changelog se comenzó el 2025-12-29, cuando el sistema llevaba un avance considerable.

## [0.6.1] - 28-01-2026

### Arreglado (Fix)

- Ahora se pueden crear dos servicios que apunten a la misma url siempre y cuando sean dos personas usuarias distintas quienes las registran. Sin embargo, aún no se pueden importar recursos desde la segunda url registrada.
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
