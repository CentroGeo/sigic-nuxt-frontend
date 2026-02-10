// Ir por defecto a la consulta de capas
export default defineNuxtRouteMiddleware(({ fullPath }) => {
  if (fullPath === '/geocontenidos/' || fullPath === '/geocontenidos') {
    return navigateTo('/geocontenidos/geohistorias');
  }
});
