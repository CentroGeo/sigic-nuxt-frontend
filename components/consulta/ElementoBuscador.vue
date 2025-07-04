<script setup>
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
</script>
<template>
  <div class="flex flex-contenido-equidistante m-y-3">
    <SisdaiCampoBusqueda class="columna-13" />
    <button
      type="button"
      class="boton-primario boton-pictograma boton-grande"
      aria-label="Filtrar"
    >
      <span class="pictograma-filtro" aria-hidden="true"></span>
    </button>
  </div>
</template>
