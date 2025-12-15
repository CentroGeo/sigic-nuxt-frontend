// Ir por defecto a la consulta de capas
export default defineNuxtRouteMiddleware((to) => {
  if (to.fullPath === '/consulta/' || to.fullPath === '/consulta') {
    return navigateTo('/consulta/capas');
  }
});
