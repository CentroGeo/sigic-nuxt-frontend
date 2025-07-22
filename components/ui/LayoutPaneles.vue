<script setup>
const storeCatalogo = useCatalogoStore();
</script>

<template>
  <div class="contenedor-paneles grid">
    <div
      :id="storeCatalogo.idNavegacionLateral"
      :class="storeCatalogo.catalogoColapsado ? 'oculto' : 'columna-4'"
      :aria-hidden="storeCatalogo.catalogoColapsado"
    >
      <slot name="catalogo">
        <p>Panel catálogo</p>
      </slot>
    </div>

    <div :class="`columna-${storeCatalogo.catalogoColapsado ? '16' : '12'}`">
      <slot name="visualizador">
        <p>Panel visualización</p>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contenedor-paneles {
  height: 100%;
  gap: 0;
}
</style>
