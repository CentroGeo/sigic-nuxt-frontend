<script setup></script>
<!-- TODO: revisar si queda mejor el de ui/ -->
<template>
  <div class="contenedor-paneles grid">
    <div class="columna-4">
      <slot name="lista">
        <p>Panel lista</p>
      </slot>
    </div>

    <div class="columna-12">
      <slot name="vistas-ia">
        <!-- <p>Panel vista</p> -->
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contenedor-paneles {
  height: 100%;
  gap: 0;

  .columna-4 {
    box-shadow: 4px 0 4px -5px var(--navegacion-primaria-sombra);
    z-index: 1;
  }
}
</style>
