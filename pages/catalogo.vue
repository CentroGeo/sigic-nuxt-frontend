<script setup>
definePageMeta({
  middleware: ['sidebase-auth', 'redireccionar-modulo-catalogo'],
  bodyAttrs: {
    class: '',
  },
});
const ruta = '/catalogo';
const storeCatalogo = useCatalogoStore();
onUnmounted(() => (document.querySelector('body').className = ''));
</script>

<template>
  <div class="modulo-catalogo flex">
    <UiNavegacionLateral
      :sub-paginas="[
        {
          pictograma: 'pictograma-explorar',
          ruta: `${ruta}/explorar`,
        },
        {
          pictograma: 'pictograma-capas',
          ruta: `${ruta}/capas`,
        },
        {
          pictograma: 'pictograma-tabla',
          ruta: `${ruta}/tablas`,
        },
        {
          pictograma: 'pictograma-documento',
          ruta: `${ruta}/documentos`,
        },
      ]"
      :id-colapsable="storeCatalogo.idNavegacionLateral"
      :estado-colapable="storeCatalogo.catalogoColapsado"
      :funcion-colapsar="storeCatalogo.alternarCatalogoColapsable"
    />
    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss">
.modulo-catalogo {
  gap: 0;
  .contenedor-contenido {
    flex: 1;
  }
}
</style>
