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
            { texto: 'Aprobados', ruta: '/levantamiento/revision-aportes' },
            {
              texto: 'En revisión',
              ruta: '/levantamiento/revision-aportes/revision',
              notificacion: false,
            },
            {
              texto: 'Rechazados',
              ruta: '/levantamiento/revision-aportes/rechazados',
              notificacion: false,
            },
          ]"
        />

        <div class="flex titulo-contenido-levantamiento">
          <h2>Aportes aprobados</h2>
          <UiNumeroElementos :numero="0" etiqueta="Aportes" />
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
