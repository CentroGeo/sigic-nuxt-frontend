<script setup>
const props = defineProps({
  resource: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
});
</script>
<template>
  <h2>{{ props.resource.title }}</h2>

  <div class="flex">
    <nuxt-link>Metadatos </nuxt-link>
    <nuxt-link>Estilo </nuxt-link>
    <nuxt-link>Clave Geoestadística </nuxt-link>
  </div>
  <div class="borde-b borde-color-secundario"></div>

  <h2>Metadatos</h2>
  <div style="display: flex; gap: 4px">
    <div
      class="borde borde-grosor-2"
      style="width: 25%; border-color: var(--color-primario-1)"
    ></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div>
  </div>
  <ol>
    <li>{{ props.title }}</li>
  </ol>
</template>
