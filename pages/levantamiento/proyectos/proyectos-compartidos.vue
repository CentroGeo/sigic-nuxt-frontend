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
            { texto: 'Proyectos públicos', ruta: '/levantamiento/proyectos' },
            {
              texto: 'Mis proyectos',
              ruta: '/levantamiento/proyectos/mis-proyectos',
              notificacion: false,
            },
            {
              texto: 'Proyectos compartidos',
              ruta: '/levantamiento/proyectos/proyectos-compartidos',
              notificacion: true,
            },
          ]"
        />

        <div class="flex">
          <h2>Proyectos compartidos</h2>
          <UiNumeroElementos :numero="0" />
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped></style>
