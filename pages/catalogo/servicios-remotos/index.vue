<script setup>
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeCatalogo = useCatalogoStore();

try {
  const { data } = useAuth();
  const token = data.value?.accessToken;
  // console.log(token);
  const response = await $fetch('https://geonode.dev.geoint.mx/api/v2/harvesters/', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  // console.log('response', response);
  const harvesters = response.harvesters;
  if (harvesters.length === 0) {
    navigateTo({
      path: '/catalogo/servicios-remotos/agregar',
    });
  } else {
    navigateTo({
      path: '/catalogo/servicios-remotos/cargados',
    });
  }
} catch (err) {
  console.warn('Error en el streaming: ' + err);
}
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main>...cargando</main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss">
form table {
  width: 100%;
}
</style>
