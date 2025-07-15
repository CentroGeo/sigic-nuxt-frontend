<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
const config = useRuntimeConfig();

const props = defineProps({
  interactionCounter: {
    type: Number,
    default: 0,
  },
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { interactionCounter, selectedElement } = toRefs(props);
const modalInformacion = ref(null);

console.log(selectedElement.value);

watch(interactionCounter, () => {
  modalInformacion.value.abrirModal();
});
</script>
<template>
  <SisdaiModal ref="modalInformacion">
    <template #encabezado>
      <h1>{{ selectedElement.title }}</h1>
    </template>
    <template #cuerpo>
      <p>Descripción: {{ selectedElement.abstract }}</p>
      <p>Origen: {{ selectedElement.attribution }}</p>
      <p>Fecha de creación: {{ selectedElement.created }}</p>
      <p>Fecha de revisión: {{ selectedElement.date }}</p>
      <p>Keywords: {{ selectedElement.keywords }}</p>
      <p>CRS: {{ selectedElement.srid }}</p>
    </template>
  </SisdaiModal>
</template>
