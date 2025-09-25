<script setup>
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
      path: '/catalogo/cargar-servicios-remotos/agregar',
    });
  } else {
    navigateTo({
      path: '/catalogo/cargar-servicios-remotos/cargados',
    });
  }
} catch (err) {
  console.warn('Error en el streaming: ' + err);
}
</script>
<template>
  <UiLayoutPaneles>
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
