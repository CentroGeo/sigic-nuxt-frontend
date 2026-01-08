# Changelog

Todos los cambios más importantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0)
y este proyecto se adhiere al [Versionamiento semántico](https://semver.org/spec/v2.0.0.html).

\*Nota: Este Changelog se comenzó el 2025-12-29, cuando el sistema llevaba un avance considerable.

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

[0.2.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/CentroGeo/sigic-nuxt-frontend/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/CentroGeo/sigic-nuxt-frontend/releases/tag/v0.0.1
