<script setup>
defineProps({
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
</script>

<template>
  <p class="numero-elementos flex m-y-1">
    <span class="etiqueta">{{ numero }}</span>
    <span>{{ etiqueta }}</span>
  </p>
</template>

<style lang="scss">
body[data-tema="claro"],
:root {
  --fondo-primario: var(--color-primario-1);
}
body[data-tema="oscuro"] {
  --fondo-primario: var(--color-primario-4);
}

.numero-elementos {
  gap: 8px;
  .etiqueta {
    background-color: var(--fondo-primario);
    color: var(--texto-primario);
  }
}
</style>
