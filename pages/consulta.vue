<script setup>
definePageMeta({ middleware: "redireccionar-modulo-consulta" });

const ruta = "/consulta";

const storeConsulta = useConsultaStore();
</script>

<template>
  <div class="modulo-consultas flex">
    <UiNavegacionLateral
      :sub-paginas="[
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
      :funcion-colapsar="storeConsulta.alternarCatalogoColapsable"
      :estado-colapable="storeConsulta.catalogoColapsado"
      :idColapsable="storeConsulta.idNavegacionLateral"
    />

    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modulo-consultas {
  gap: 0;
  height: 85vh;

  .contenedor-contenido {
    flex: 1;
  }
}
</style>
