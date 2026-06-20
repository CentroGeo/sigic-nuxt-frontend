<script setup>
const storeConsulta = useConsultaStore();

const props = defineProps({
  // Cuando es false se omite el panel de selección y el visualizador absorbe su espacio.
  mostrarSeleccion: { type: Boolean, default: true },
});

const columnasVisualizador = computed(() => {
  let cols = 16;
  if (!storeConsulta.catalogoColapsado) cols -= 4; // panel catálogo visible
  if (props.mostrarSeleccion) cols -= 4; // panel selección visible
  return cols;
});
</script>

<!-- TODO: revisar si les laten cómo quedo el de ui/ -->
<template>
  <div class="contenedor-paneles grid">
    <div
      id="consulta-navegacion-lateral"
      :class="storeConsulta.catalogoColapsado ? 'oculto' : 'columna-4'"
      :aria-hidden="storeConsulta.catalogoColapsado"
    >
      <slot name="catalogo">
        <p>Panel catálogo</p>
      </slot>
    </div>
    <!--      class="fondo-color-neutro"
-->
    <div :class="`columna-${columnasVisualizador}`">
      <slot name="visualizador">
        <p>Panel visualización</p>
      </slot>
    </div>

    <div v-if="mostrarSeleccion" class="columna-4">
      <slot name="seleccion">
        <p>Panel selección</p>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contenedor-paneles {
  height: 100%;
  gap: 0;
}
</style>
