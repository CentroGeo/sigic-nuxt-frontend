// Ir por defecto a la consulta de capas
export default defineNuxtRouteMiddleware((to) => {
  if (to.fullPath === '/levantamiento/' || to.fullPath === '/levantamiento') {
    return navigateTo('/levantamiento/proyectos');
  }
});
