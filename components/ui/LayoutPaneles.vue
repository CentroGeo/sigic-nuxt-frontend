<script setup>
const storeCatalogo = useCatalogoStore();
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
</script>
<template>
  <div class="contenedor-paneles grid">
    <div
      v-if="paneles === 3"
      :id="storeCatalogo.idNavegacionLateral"
      :class="storeCatalogo.catalogoColapsado ? 'oculto' : 'columna-4'"
      :aria-hidden="storeCatalogo.catalogoColapsado"
    >
      <slot name="catalogo">
        <p>Panel catálogo</p>
      </slot>
    </div>
    <div
      v-if="paneles == 2"
      :id="storeCatalogo.idNavegacionLateral"
      :class="storeCatalogo.catalogoColapsado ? 'oculto' : 'columna-4'"
      :aria-hidden="storeCatalogo.catalogoColapsado"
      class="menu-lateral-fondo"
    >
      <slot name="catalogo">
        <p>Panel catálogo</p>
      </slot>
    </div>

    <div :class="`columna-${storeCatalogo.catalogoColapsado ? '16' : '12'}`">
      <slot name="visualizador">
        <p>Panel visualización</p>
      </slot>
    </div>
    <!-- TODO: unir condición ? : -->
    <div
      v-if="paneles === 3"
      :class="`columna-${storeCatalogo.catalogoColapsado ? '12' : '8'}`"
    >
      <slot name="visualizador">
        <p>Panel visualización</p>
      </slot>
    </div>

    <div v-if="paneles === 3" class="columna-4">
      <slot name="seleccion">
        <p>Panel de selección</p>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contenedor-paneles {
  // height: 100%;
  gap: 0;
}
</style>
