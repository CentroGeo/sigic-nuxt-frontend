export default defineNuxtRouteMiddleware((to, from) => {
  const { status } = useAuth();

  // Si no está autenticado y no está cargando, redirigir al inicio
  if (status.value !== 'authenticated') {
    return navigateTo('/');
  }
});
