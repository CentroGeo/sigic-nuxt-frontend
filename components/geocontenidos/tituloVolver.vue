<script setup>
defineProps({
  titulo: {
    type: String,
    default: 'Título',
  },
  volver: {
    type: String,
    default: '',
  },
});

const config = useRuntimeConfig();
const { baseURL, basePath } = config.public;
</script>

<template>
  <section class="flex p-y-3">
    <NuxtLink
      :to="`${baseURL}${basePath}/geocontenidos${volver}`"
      class="boton boton-secundario boton-chico"
    >
      <span class="pictograma-flecha-izquierda m-r-1" />
    </NuxtLink>

    <h2 class="m-0">{{ titulo }}</h2>
  </section>
</template>
