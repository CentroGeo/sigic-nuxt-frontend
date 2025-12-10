<script setup>
const storeConsulta = useConsultaStore();
</script>

<!-- TODO: revisar si les laten cómo quedo el de ui/ -->
<template>
  <div class="contenedor-paneles grid">
    <div
      id="consulta-navegacion-lateral"
      :class="storeConsulta.catalogoColapsado ? 'oculto' : 'columna-4'"
      :aria-hidden="storeConsulta.catalogoColapsado"
    >
      <slot name="catalogo">
        <p>Panel catálogo</p>
      </slot>
    </div>
    <!--      class="fondo-color-neutro"
-->
    <div :class="`columna-${storeConsulta.catalogoColapsado ? '12' : '8'}`">
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
