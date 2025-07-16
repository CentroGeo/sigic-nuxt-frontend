<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
</script>
<template>
  <div class="busqueda">
    <SisdaiCampoBusqueda />
    <button
      type="button"
      class="boton-primario boton-pictograma boton-grande"
      aria-label="Filtrar"
    >
      <span class="pictograma-filtro" aria-hidden="true"></span>
    </button>
  </div>
</template>

<style lang="scss">
.busqueda {
  //background-color: pink;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: 20px 0px;
}
.campo-busqueda {
  width: 80%;
}
</style>
