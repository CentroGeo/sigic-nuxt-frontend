<script setup>
import { toRefs } from "vue";

const props = defineProps({
  numero: {
    type: Number,
    default: 999,
  },
  etiqueta: {
    type: String,
    default: "Elementos",
  },
});

const { numero } = toRefs(props);
</script>

<template>
  <p class="numero-elementos flex m-0">
    <span class="etiqueta">{{ numero }}</span>
    <span>{{ etiqueta }}</span>
  </p>
</template>

<style lang="scss">
.numero-elementos {
  gap: 10px;
}
</style>
