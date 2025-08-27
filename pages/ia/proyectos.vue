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
      <main id="principal" class="contenedor m-b-10 p-t-3">
        <IaLeyendaInicioVistas />

        <IaVistaProyectos v-if="storeIA.existenProyectos" />
      </main>
    </template>
  </IaLayoutPaneles>
</template>
