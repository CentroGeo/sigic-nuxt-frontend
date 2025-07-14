<script setup>
import { ref } from "vue";

const storeIA = useIAStore();
// TODO: subir lista al store
const proyectos = ref([
  {
    id: 0,
    titulo: "Biodiversidad de ecosistemas marinos",
    numero_contextos: 0,
    numero_fuentes: 9,
  },
  // {
  //   id: 1,
  //   titulo: "Nombre del proyecto",
  //   numero_contextos: 5,
  //   numero_fuentes: 5,
  // },
]);
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <!-- TODO: lista leyenda inicio? -->
      <IaLayoutListas
        texto-boton="Crear proyecto"
        titulo="Proyectos"
        etiqueta-busqueda="Buscar un proyecto"
        :recurso-lista="proyectos"
      />
    </template>

    <template #vistas-ia>
      <IaVistaLeyendaInicio v-if="!storeIA.existenProyectos" />

      <IaVistaProyectos v-else />
    </template>
  </IaLayoutPaneles>
</template>
