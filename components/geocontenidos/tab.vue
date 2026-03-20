<script setup>
defineProps({
  layoutStyles: { type: Object, default: () => ({}) },
  tabs: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['alClickTab']);
</script>

<template>
  <div
    class="linea-tiempo flex flex-contenido-centrado"
    :style="{
      background: `linear-gradient(to right, ${layoutStyles.gradient_start}, ${layoutStyles.gradient_end})`,
    }"
  >
    <button
      v-for="({ id }, idx) in tabs"
      :key="id"
      class="button-tab fondo-color-primario"
      @click="() => $emit('alClickTab', id)"
    >
      {{ idx + 1 }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.linea-tiempo {
  width: 100%;
  height: 100px;
  align-content: center;

  .boton-tab {
    width: 50px;
    height: 50px;
    // border-radius: 50%;
    // color: var(-- texto-color-primario);
    // font-weight: bold;
    // display: flex;
    // align-items: center;
    // justify-content: center;
  }
}
</style>
