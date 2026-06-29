export default defineNuxtRouteMiddleware(() => {
  const { data } = useAuth();
  if (!data.value) {
    return navigateTo('/catalogo/servicios-remotos/servicios-sugeridos');
  }
});
