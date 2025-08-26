<script setup>
const storeIA = useIAStore();
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaLayoutListas
        titulo="Proyectos"
        texto-boton="Nuevo proyecto"
        etiqueta-busqueda="Buscar un proyecto"
      />
    </template>

    <template #vistas-ia>
      <IaLeyendaInicioVistas />

      <IaVistaProyectos v-if="storeIA.existenProyectos" />
    </template>
  </IaLayoutPaneles>
</template>
