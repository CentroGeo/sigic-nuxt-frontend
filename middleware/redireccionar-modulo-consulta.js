// Ir por defecto a la consulta de capas
export default defineNuxtRouteMiddleware((to) => {
  if (to.fullPath === "/consulta/" || to.fullPath === "/consulta") {
    // console.log("R E D E R I G I R");
    return navigateTo("/consulta/capas");
  }
});
