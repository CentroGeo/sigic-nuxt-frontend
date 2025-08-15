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
          globo: 'Explorar',
        },
        {
          pictograma: 'pictograma-capas',
          ruta: `${ruta}/capas`,
          globo: 'Capas',
        },
        {
          pictograma: 'pictograma-tabla',
          ruta: `${ruta}/tablas`,
          globo: 'Datos tabulados',
        },
        {
          pictograma: 'pictograma-documento',
          ruta: `${ruta}/documentos`,
          globo: 'Documentos',
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
