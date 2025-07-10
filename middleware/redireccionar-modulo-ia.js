// Ir por defecto a la consulta de capas
export default defineNuxtRouteMiddleware((to) => {
  if (to.fullPath === "/ia/" || to.fullPath === "/ia") {
    // console.log("R E D E R I G I R");
    return navigateTo("/ia/chats");
  }
});
