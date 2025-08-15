<script setup>
const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  tag: {
    type: String,
    default: 'Capas',
  },
  numberElements: {
    type: Number,
    default: 0,
  },
});
const { title, tag, numberElements } = toRefs(props);

const estadoAbierto = ref(false);
</script>

<template>
  <button
    class="categoria-colapsable flex-contenido-separado borde-redondeado-0 fondo-color-acento borde-l borde-grosor-4 borde-color-error"
    @click="estadoAbierto = !estadoAbierto"
  >
    <div>
      <p class="m-0">
        {{ title }}
      </p>

      <UiNumeroElementos :numero="numberElements" :etiqueta="tag" />
    </div>

    <span
      class="pictograma-grande p-0"
      :class="`pictograma-angulo-${estadoAbierto ? 'arriba' : 'abajo'}`"
      aria-hidden="true"
    />
  </button>
</template>

<style lang="scss" scoped>
.categoria-colapsable {
  // justify-content: space-between;
  width: 100%;
  align-items: flex-start;

  [class^='pictograma-'] {
    font-size: 1.75rem;
  }
}
</style>
