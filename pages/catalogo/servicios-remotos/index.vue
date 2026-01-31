<script setup>
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeCatalogo = useCatalogoStore();

navigateTo({
  path: '/catalogo/servicios-remotos/agregar',
});
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
