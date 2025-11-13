<script setup>
definePageMeta({
  middleware: ['auth', 'redireccionar-modulo-levantamiento'],
});
const storeLevantamiento = useLevantamientoStore();
const ruta = '/levantamiento';
</script>

<template>
  <div class="modulo-levantamiento flex">
    <UiNavegacionLateral
      :sub-paginas="[
        {
          pictograma: 'pictograma-visualizador',
          ruta: `${ruta}/proyectos`,
          globo: 'Proyectos',
        },
        {
          pictograma: 'pictograma-grupo',
          ruta: `${ruta}/aportes`,
          globo: 'Aportes',
        },
      ]"
      :funcion-colapsar="storeLevantamiento.alternarCatalogoColapsable"
      :estado-colapable="storeLevantamiento.catalogoColapsado"
      :id-colapsable="storeLevantamiento.idNavegacionLateral"
    />
    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modulo-levantamiento {
  --altura-consulta-esc: calc(100vh - 112px);
  height: var(--altura-consulta-esc);
  gap: 0;
  .contenedor-contenido {
    flex: 1;
    .columna-4,
    .columna-8,
    .columna-12,
    .columna-16 {
      height: var(--altura-consulta-esc);
    }
  }
}
</style>
