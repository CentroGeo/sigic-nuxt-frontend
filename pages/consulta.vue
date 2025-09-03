<script setup>
definePageMeta({
  middleware: 'redireccionar-modulo-consulta',
  bodyAttrs: {
    class: '',
  },
});

const ruta = '/consulta';

const storeConsulta = useConsultaStore();
onUnmounted(() => (document.querySelector('body').className = ''));
</script>

<template>
  <div class="modulo-consultas flex">
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
  --altura-consulta-esc: 85vh;
  height: var(--altura-consulta-esc);
  gap: 0;

  .contenedor-contenido {
    flex: 1;
  }
}
</style>
