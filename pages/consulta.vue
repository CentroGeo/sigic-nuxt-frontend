<script setup>
definePageMeta({ middleware: "redireccionar-modulo-consulta" });
</script>

<template>
  <div class="modulo-consultas flex">
    <ConsultaNavegacionLateral />

    <div class="contenedor-contenido">
      <NuxtPage />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modulo-consultas {
  gap: 0;
  height: 85vh;

  .contenedor-contenido {
    flex: 1;
  }
}
</style>
