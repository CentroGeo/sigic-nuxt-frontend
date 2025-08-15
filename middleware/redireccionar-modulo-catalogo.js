// Ir por defecto a la consulta de capas
export default defineNuxtRouteMiddleware((to) => {
  if (to.fullPath === '/catalogo/' || to.fullPath === '/catalogo') {
    return navigateTo('/catalogo/explorar');
  }
});
