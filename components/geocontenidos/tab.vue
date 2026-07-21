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
    class="linea-tiempo flex flex-contenido-centrado p-2"
    :style="{
      background: `linear-gradient(to right, ${layoutStyles.gradient_start}, ${layoutStyles.gradient_end})`,
    }"
  >
    <button
      v-for="({ id }, idx) in tabs"
      :key="`menu-tab-opcion-${id}`"
      class="boton-tab fondo-color-primario"
      :style="{
        background: `linear-gradient(to right, ${layoutStyles.gradient_start}, ${layoutStyles.gradient_end})`,
      }"
      @click="() => $emit('alClickTab', id)"
    >
      {{ idx + 1 }}
    </button>
  </div>
</template>

<style lang="scss">
.linea-tiempo {
  min-height: 80px;
  align-content: center;

  .boton-tab {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    padding: 16px 21px;
    box-shadow: rgba(252, 190, 165, 0.314) 0px 0px 20px;
    border: 4px solid rgba(255, 255, 255, 0.5);
    border-color: #fff;
    color: #fff;
  }
}
</style>
