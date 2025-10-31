<script setup></script>

<template>
  <div
    class="columna-8 texto-centrado fondo-color-acento p-2 borde-redondeado-8 contenido-participantes"
  >
    <span class="pictograma-grupo pictograma-grande texto-color-acento"></span>
    <h6 class="m-t-0 m-b-1 texto-color-secundario">Invita participantes</h6>
    <p class="m-t-0 m-b-1">
      Define si tu proyecto es publico o privado e invita a otras personas a participar con aportes.
    </p>
    <div class="texto-centrado">
      <NuxtLink
        class="boton-primario boton boton-chico"
        aria-label="Crear nuevo proyecto"
        to="/levantamiento/proyectos/mis-proyectos/nuevo"
      >
        Agregar participantes
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.contenido-participantes {
  align-self: center;
}
</style>
