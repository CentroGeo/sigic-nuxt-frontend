<script setup>
import { ref } from "vue";
import { useIAStore } from "~/stores/ia.js";
const storeIA = useIAStore();

const listadoChats = ref([
  {
    fecha: "01-07-2025",
    chat: [
      {
        id: 0,
        titulo: "Cobertura e integración de datos en el monitoreo marino",
        proyecto: "Biodiversidad de ecosistemas marinos",
        contexto: "Tecnologías para monitoreo marino",
      },
    ],
  },
  {
    fecha: "01-06-2025",
    chat: [
      {
        id: 1,
        titulo: "Análisis e integración de datos en el monitoreo marino",
        proyecto: "Biodiversidad de ecosistemas marinos",
        contexto: "Tecnologías para monitoreo marino",
      },
      {
        id: 2,
        titulo: "Diseño e integración de datos en el monitoreo marino",
        proyecto: "Biodiversidad de ecosistemas marinos",
        contexto: "Tecnologías para monitoreo marino",
      },
    ],
  },
]);
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaListaLeyendaInicio v-if="!storeIA.existenProyectos" />

      <IaLayoutListas
        v-else
        texto-boton="Nuevo chat"
        titulo="Chats"
        etiqueta-busqueda="Buscar chats"
        :recurso-lista="listadoChats"
      />
    </template>

    <template #vistas-ia>
      <IaVistaLeyendaInicio v-if="!storeIA.existenProyectos" />

      <div v-else>Da click en un chat para iniciar o crea un nuevo chat</div>
    </template>
  </IaLayoutPaneles>
</template>
