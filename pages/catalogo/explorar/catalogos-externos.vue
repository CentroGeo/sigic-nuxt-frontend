<script setup>
const storeCatalogo = useCatalogoStore();
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>
    <template #visualizador>
      <main id="principal" class="contenedor">
        <h2>Servicios remotos</h2>
        <CatalogoCatalogosInstitucionales />
        <CatalogoCatalogosUsuarios />
      </main>
    </template>
  </UiLayoutPaneles>
</template>
