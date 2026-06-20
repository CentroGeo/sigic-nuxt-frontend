/**
 * Construye rutas/URLs que respetan el base URL de la app (NUXT_APP_BASE_URL).
 *
 * En producción la app vive bajo un prefijo (p. ej. `/app/`), por lo que las
 * URLs absolutas construidas a mano con `window.location.origin` deben incluir
 * ese prefijo. `NuxtLink`/`navigateTo` lo agregan solos; estas funciones son
 * para los casos manuales (window.open, enlaces para copiar, src de iframes).
 */
export function useUrlAbsoluta() {
  const config = useRuntimeConfig();

  // config.app.baseURL termina en '/' ('/' en dev, '/app/' en prod).
  function rutaApp(path) {
    const base = config.app.baseURL || '/';
    return `${base}${String(path).replace(/^\//, '')}`;
  }

  function urlAbsoluta(path) {
    const origen = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origen}${rutaApp(path)}`;
  }

  return { rutaApp, urlAbsoluta };
}
