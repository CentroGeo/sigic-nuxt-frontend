<script setup>
import { ref } from "vue";
const listadoChats = ref([
  {
    id: 0,
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
    id: 1,
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
      <IaLayoutListas
        texto-boton="Nuevo chat"
        titulo="Chats"
        etiqueta-busqueda="Buscar chats"
        :recurso-lista="listadoChats"
      />
    </template>

    <template #vistas-ia>
      <IaContenedorChat />
    </template>
  </IaLayoutPaneles>
</template>
