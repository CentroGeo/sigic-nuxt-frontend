<script setup>
const props = defineProps({
  title: {
    type: String,
    default: undefined,
  },
  tag: {
    type: String,
    default: "Capas",
  },
  numberElements: {
    type: Number,
    default: 0,
  },
});
const { title, tag, numberElements } = toRefs(props);
</script>
<template>
  <div class="tarjeta">
    <div class="m-x-2">
      <div class="flex columna-16">
        <p class="tarjeta-titulo columna-8">{{ title }}</p>
        <span
          class="pictograma-angulo-abajo pictograma-mediano"
          aria-hidden="true"
        ></span>
      </div>
      <UiNumeroElementos :numero="numberElements" :etiqueta="tag" />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.tarjeta {
  background-color: var(--color-secundario-2);
  border-radius: 0px;
  border-left: solid 8px var(--color-secundario-8);
}
</style>
