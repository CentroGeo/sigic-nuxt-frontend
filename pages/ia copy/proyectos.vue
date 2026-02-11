<script setup>
const storeIA = useIAStore();
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <IaLayoutListas
        titulo="Proyectos"
        texto-boton="Nuevo proyecto"
        etiqueta-busqueda="Buscar un proyecto"
      />
    </template>

    <template #visualizador>
      <main id="principal" class="">
        <IaLeyendaInicioVistas />

        <IaVistaProyectos v-if="storeIA.existenProyectos" />
      </main>
    </template>
  </UiLayoutPaneles>
</template>
