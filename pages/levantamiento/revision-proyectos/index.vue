<script setup>
definePageMeta({
  middleware: 'auth',
});

const storeLevantamiento = useLevantamientoStore();
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeLevantamiento.catalogoColapsado">
    <template #catalogo>
      <LevantamientoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="principal-levantamiento flex contenedor m-b-10 m-t-3">
        <LevantamientoMenuSecundario
          :opciones="[
            { texto: 'Aprobados', ruta: '/levantamiento/revision-proyectos' },
            {
              texto: 'En revisión',
              ruta: '/levantamiento/revision-proyectos/revision',
              notificacion: false,
            },
            {
              texto: 'Rechazados',
              ruta: '/levantamiento/revision-proyectos/rechazados',
              notificacion: false,
            },
          ]"
        />

        <div class="flex titulo-contenido-levantamiento">
          <h2>Proyectos aprobados</h2>
          <UiNumeroElementos :numero="0" etiqueta="Proyectos" />
        </div>
        <div
          v-if="!storeLevantamiento.existenProyectosAprobados"
          class="flex texto-centrado contenido-levantamiento"
        >
          <div class="columna-4"></div>
          <div class="columna-8 fondo-color-acento p-2 borde-redondeado-8">
            <span class="pictograma-archivo-descargar pictograma-grande texto-color-acento"></span>
            <h6 class="m-t-0 m-b-1 texto-color-secundario">No has aprobado proyectos</h6>
            <p class="m-t-0 m-b-1">Todos los proyectos que apruebes aparecerán en esta sección.</p>
            <div class="texto-centrado">
              <button class="boton-primario boton-chico">Revisar proyectos pendientes</button>
            </div>
          </div>
          <div class="columna-4"></div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.titulo-contenido-levantamiento {
  align-items: center;
}

.principal-levantamiento {
  flex-direction: column;
  gap: 0;
}

.contenido-levantamiento {
  flex: 1;
  align-items: center;
}
</style>
