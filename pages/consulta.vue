<script setup>
definePageMeta({
  middleware: 'redireccionar-modulo-consulta',
  bodyAttrs: {
    class: '',
  },
});

const ruta = '/consulta';
const route = useRoute();

const storeConsulta = useConsultaStore();

const enVisualizarMapa = computed(() => /\/mapas\/[^/]+\/(visualizar|embed)$/.test(route.path));

onUnmounted(() => (document.querySelector('body').className = ''));
</script>

<template>
  <NuxtPage v-if="enVisualizarMapa" />
  <div v-else class="modulo-consultas flex">
    <UiNavegacionLateral
      :sub-paginas="[
        {
          pictograma: 'pictograma-capas',
          ruta: `${ruta}/capas`,
          globo: 'Capas geográficas',
        },
        {
          pictograma: 'pictograma-tabla',
          ruta: `${ruta}/tablas`,
          globo: 'Tabulados de datos',
        },
        {
          pictograma: 'pictograma-documento',
          ruta: `${ruta}/documentos`,
          globo: 'Documentos',
        },
        {
          pictograma: 'pictograma-explorar',
          ruta: `${ruta}/mapas`,
          globo: 'Mapas',
        },
      ]"
      :funcion-colapsar="storeConsulta.alternarCatalogoColapsable"
      :estado-colapable="storeConsulta.catalogoColapsado"
      id-colapsable="consulta-navegacion-lateral"
    />

    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modulo-consultas {
  --altura-consulta-esc: calc(100vh - 112px);
  height: var(--altura-consulta-esc);
  gap: 0;

  .contenedor-contenido {
    flex: 1;
  }
}
</style>
