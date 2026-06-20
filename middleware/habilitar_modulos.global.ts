// SPDX-FileCopyrightText: 2025 CentroGeo
// SPDX-FileContributor: César Benjamín <cesarbenjamindotnet@gmail.com>
// SPDX-License-Identifier: MIT
//
// Descripción:
//   Middleware global de Nuxt 3 que controla el acceso a rutas mediante
//   feature flags definidos en `runtimeConfig.public`.
//   - Define la interfaz `FeatureFlags` para habilitar o deshabilitar
//     funcionalidades como autenticación, catálogo, consulta o IAA.
//   - Construye un mapa de reglas (ruta → condición).
//   - Si el usuario accede a una ruta deshabilitada, aborta la navegación
//     devolviendo un 404 (con opción a redirigir a la raíz).
//
//   Esto permite activar o desactivar secciones enteras de la aplicación
//   según configuración de despliegue o entorno.

interface FeatureFlags {
  enableAuth: boolean;
  enableCatalogoVista: boolean;
  enableCatalogoCarga: boolean;
  enableConsulta: boolean;
  enableIaa: boolean;
  enableLevantamiento: boolean;
  enableMapas: boolean;
  enableAcercaDe: boolean;
  enableGeocontenidos: boolean;
  enableGeohistorias: boolean;
  enableTableros: boolean;
}

export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig();
  const flags = config.public as unknown as FeatureFlags;

  // reglas de acceso
  const rules: Record<string, boolean> = {
    // --- Catálogo Vista ---
    '/catalogo/explorar': flags.enableCatalogoVista,

    // --- Catálogo Carga (y sus internas) ---
    '/catalogo/cargar-servicios-remotos':
      flags.enableAuth && flags.enableCatalogoVista && flags.enableCatalogoCarga,
    '/catalogo/mis-recursos':
      flags.enableAuth && flags.enableCatalogoVista && flags.enableCatalogoCarga,
    '/catalogo/cargar-archivos':
      flags.enableAuth && flags.enableCatalogoVista && flags.enableCatalogoCarga,

    // --- Consulta ---
    '/consulta': flags.enableConsulta,

    // --- IAA (y sus internas) ---
    '/ia': flags.enableAuth && flags.enableIaa,

    // --- Levantamiento (y sus internas) ---
    '/levantamiento': flags.enableAuth && flags.enableLevantamiento,

    // --- Mapas (explorar en catálogo, explorador en consulta, gestión en geocontenidos) ---
    '/catalogo/explorar/mapas': flags.enableMapas,
    '/consulta/mapas': flags.enableMapas,
    '/geocontenidos/mapas': flags.enableMapas,
    // --- Acerca de ---
    '/acerca-de': flags.enableAcercaDe,

    // --- Geocontenidos (y sus internas) ---
    '/geocontenidos': flags.enableGeocontenidos,

    // --- Geohistorias (vista pública) ---
    '/geohistorias': flags.enableGeohistorias,

    // --- Tableros (vista pública, catch-all) ---
    '/tableros': flags.enableTableros,
  };

  for (const [prefix, allowed] of Object.entries(rules)) {
    if (to.path.startsWith(prefix) && !allowed) {
      return abortNavigation(); // devuelve 404
      // o: return navigateTo("/") para redirigir
    }
  }
});
