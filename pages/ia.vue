<script setup>
definePageMeta({ middleware: "redireccionar-modulo-ia" });
</script>

<template>
  <div class="modulo-ia flex">
    <IaNavegacionLateral />

    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modulo-ia {
  gap: 0;
  height: 85vh;
  .contenedor-contenido {
    flex: 1;
  }
}
</style>
