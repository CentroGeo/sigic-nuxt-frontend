<script setup>
import { toRefs } from "vue";

const props = defineProps({
  /**
   * Etiqueta en el contador que se mostrará.
   * @type {String}
   * @default 'Elementos'
   */
  etiqueta: {
    type: String,
    default: "Elementos",
  },

  /**
   * Número que se mostrará.
   * @type {Number}
   * @default 999
   */
  numero: {
    type: Number,
    default: 999,
  },
});

const { etiqueta, numero } = toRefs(props);
</script>

<template>
  <p class="numero-elementos flex m-y-1">
    <span class="etiqueta">{{ numero }}</span>
    <span>{{ etiqueta }}</span>
  </p>
</template>

<style lang="scss">
.numero-elementos {
  gap: 10px;
}
</style>
