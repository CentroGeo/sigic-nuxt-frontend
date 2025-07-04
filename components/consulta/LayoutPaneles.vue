<script setup>
const storeConsulta = useConsultaStore();
</script>

<template>
  <div class="contenedor-paneles grid">
    <div
      :id="storeConsulta.idNavegacionLateral"
      :class="storeConsulta.catalogoColapsado ? 'oculto' : 'columna-4'"
      :aria-hidden="storeConsulta.catalogoColapsado"
    >
      <slot name="catalogo">
        <p>Panel catálogo</p>
      </slot>
    </div>

    <div
      class="fondo-color-neutro"
      :class="`columna-${storeConsulta.catalogoColapsado ? '12' : '8'}`"
    >
      <slot name="visualizador">
        <p>Panel visualización</p>
      </slot>
    </div>

    <div class="columna-4">
      <slot name="seleccion">
        <p>Panel selección</p>
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
