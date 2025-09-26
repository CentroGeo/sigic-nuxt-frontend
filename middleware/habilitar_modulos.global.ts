// middleware/feature-flags.global.ts
interface FeatureFlags {
  enableAuth: boolean;
  enableCatalogoVista: boolean;
  enableCatalogoCarga: boolean;
  enableConsulta: boolean;
  enableIaa: boolean;
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
    '/catalogo/mis-archivos':
      flags.enableAuth && flags.enableCatalogoVista && flags.enableCatalogoCarga,
    '/catalogo/cargar-archivos':
      flags.enableAuth && flags.enableCatalogoVista && flags.enableCatalogoCarga,

    // --- Consulta ---
    '/consulta': flags.enableConsulta,

    // --- IAA (y sus internas) ---
    '/ia': flags.enableAuth && flags.enableIaa,
  };

  for (const [prefix, allowed] of Object.entries(rules)) {
    if (to.path.startsWith(prefix) && !allowed) {
      return abortNavigation(); // devuelve 404
      // o: return navigateTo("/") para redirigir
    }
  }
});
