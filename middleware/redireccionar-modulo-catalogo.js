// Ir por defecto a la consulta de capas
export default defineNuxtRouteMiddleware((to) => {
  if (to.fullPath === '/catalogo/' || to.fullPath === '/catalogo') {
    return navigateTo('/catalogo/explorar');
  }
  if (
    to.fullPath === '/catalogo/revision-solicitudes/' ||
    to.fullPath === '/catalogo/revision-solicitudes'
  ) {
    return navigateTo('/catalogo/revision-solicitudes/pendientes-revisor');
  }
});
