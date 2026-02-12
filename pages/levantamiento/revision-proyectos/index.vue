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
      <main id="principal" class="contenedor m-b-10 m-t-3">
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
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.titulo-contenido-levantamiento {
  align-items: center;
}
</style>
