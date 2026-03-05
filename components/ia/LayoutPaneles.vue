<script setup>
/**
 * @typedef {Object} Props
 * @property {Number} [paneles=2] - Indica el número de paneles a utilizar.
 * @property {Boolean} [estadoColapable=false] - Estado del icono colapsar, visible si se recibe la `funcionColapsar`.
 */

/** @type {Props} */
defineProps({
  paneles: {
    type: Number,
    default: 2,
  },
  estadoColapable: {
    type: Boolean,
    default: false,
  },
});
const route = useRoute();
</script>
<template>
  <div class="contenedor-paneles grid">
    <div
      :class="`
      ${estadoColapable ? 'oculto' : 'columna-4'} 
      ${paneles === 2 && !route.path.includes('/ia/') ? 'menu-lateral-fondo' : ''}`"
    >
      <slot name="catalogo"> </slot>
    </div>

    <div class="columna-7">
      <slot name="visualizador">
        <!-- <p>Panel visualización</p> -->
      </slot>
    </div>

    <div class="columna-5">
      <slot name="seleccion">
        <!-- <p>Panel de selección</p> -->
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contenedor-paneles {
  height: var(--altura-consulta-esc);
  gap: 0;

  .columna-4 {
    box-shadow: 4px 0 4px -5px var(--navegacion-primaria-sombra);
    height: var(--altura-consulta-esc);
    z-index: 1;
  }
  .columna-5 {
    box-shadow: 4px -6px 8px 4px var(--navegacion-primaria-sombra);
    height: var(--altura-consulta-esc);
    z-index: 1;
  }
  .columna-16,
  .columna-12,
  .columna-17,
  .columna-8,
  .columna-5 {
    height: var(--altura-consulta-esc);
    overflow: auto;
  }
}
</style>
