<script setup>
definePageMeta({ middleware: "redireccionar-modulo-catalogo" });

const ruta = "/catalogo";

const storeCatalogo = useCatalogoStore();
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
      :funcion-colapsar="storeCatalogo.alternarCatalogoColapsable"
      :estado-colapable="storeCatalogo.catalogoColapsado"
      :id-colapsable="storeCatalogo.idNavegacionLateral"
    />
    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>
<style lang="scss">
.modulo-catalogo {
  gap: 0;
  height: 85vh;

  .contenedor-contenido {
    flex: 1;
  }
}
</style>
