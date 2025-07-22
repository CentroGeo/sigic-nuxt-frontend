<script setup>
const storeIA = useIAStore();
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <!-- TODO: lista leyenda inicio? -->
      <IaLayoutListas
        texto-boton="Crear proyecto"
        titulo="Proyectos"
        etiqueta-busqueda="Buscar un proyecto"
      />
    </template>

    <template #vistas-ia>
      <IaLeyendaInicioVistas />

      <IaVistaProyectos v-if="storeIA.existenProyectos" />
    </template>
  </IaLayoutPaneles>
</template>
