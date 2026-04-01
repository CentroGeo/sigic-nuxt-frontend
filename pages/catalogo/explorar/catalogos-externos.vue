<script setup>
const { data } = useAuth();
const storeCatalogo = useCatalogoStore();
const isLoggedIn = ref(data.value ? true : false);
onMounted(() => {
  if (isLoggedIn.value === false) {
    navigateTo({
      path: `/catalogo/servicios-remotos/servicios-sugeridos`,
    });
  }
});
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>
    <template #visualizador>
      <main v-if="isLoggedIn" id="principal" class="contenedor">
        <h2>Servicios remotos</h2>
        <CatalogoCatalogosInstitucionales />
        <CatalogoCatalogosUsuarios />
      </main>
    </template>
  </UiLayoutPaneles>
</template>
