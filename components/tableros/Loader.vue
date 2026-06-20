<script setup>
defineProps({
  mensaje: {
    type: String,
    default: 'Cargando tablero...',
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
  padding: 4rem 0;
}
</style>
