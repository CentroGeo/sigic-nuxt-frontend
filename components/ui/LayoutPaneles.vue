<script setup>
/**
 * @typedef {Object} Props
 * @property {Number} [paneles=2] - Indica el número de paneles a utilizar.
 */

/** @type {Props} */
defineProps({
  paneles: {
    type: Number,
    default: 2,
  },
});
// store
const storeCatalogo = useCatalogoStore();
const route = useRoute();
</script>
<template>
  <div class="contenedor-paneles grid">
    <div
      :class="`
      ${storeCatalogo.catalogoColapsado ? 'oculto' : 'columna-4'} 
      ${paneles === 2 && !route.path.includes('/ia/') ? 'menu-lateral-fondo' : ''}`"
    >
      <slot name="catalogo">
        <p>Panel catálogo</p>
      </slot>
    </div>

    <div
      :class="`${
        paneles === 2
          ? `columna-${storeCatalogo.catalogoColapsado ? '16' : '12'}`
          : paneles === 3
            ? `columna-${storeCatalogo.catalogoColapsado ? '12' : '8'}`
            : ''
      }`"
    >
      <slot name="visualizador">
        <!-- <p>Panel visualización</p> -->
      </slot>
    </div>

    <div v-if="paneles === 3" class="columna-4">
      <slot name="seleccion">
        <!-- <p>Panel de selección</p> -->
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contenedor-paneles {
  // height: 100%;
  gap: 0;

  .columna-4 {
    box-shadow: 4px 0 4px -5px var(--navegacion-primaria-sombra);
    z-index: 1;
  }
}
</style>
