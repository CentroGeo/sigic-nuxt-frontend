<script setup>
defineProps({
  mensaje: {
    type: String,
    default: 'Cargando...',
  },
});
</script>

<template>
  <div class="loader flex flex-contenido-centrado">
    <img src="/img/loader.gif" :alt="mensaje" />

    <p>{{ mensaje }}</p>
  </div>
</template>

<style lang="scss" scoped>
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>
