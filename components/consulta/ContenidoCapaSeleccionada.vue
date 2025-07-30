<script setup>
const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);

const tablaChild = ref(null);
const downloadChild = ref(null);

function notifyTabla() {
  tablaChild.value?.abrirModalTabla();
}
function notifyDownloadChild() {
  downloadChild.value?.abrirModalDescarga();
}
// Aqui se acaba la parte nueva para la prueba
const optionsButtons = ref([
  {
    label: 'Hacer zoom',
    pictogram: 'pictograma-zoom-instruccional',
    action: () => {
      console.warn('hacer zoom');
    },
  },
  {
    label: 'Ver tablas',
    pictogram: 'pictograma-tabla',
    action: () => {
      notifyTabla();
    },
  },
  {
    label: 'Mostrar',
    pictogram: 'pictograma-ojo-ver',
    action: () => {
      console.warn('Mostrar u ocultar la capa');
    },
  },
  {
    label: 'Cambiar opacidad',
    pictogram: 'pictograma-editar',
    action: () => {
      console.warn('cambiar opacidad');
    },
  },
  {
    label: 'Eliminar selección',
    pictogram: 'pictograma-eliminar',
    action: () => {
      resourcesStore.removeResource(resourceType.value, selectedElement.value);
    },
  },
  {
    label: 'Descargar archivo',
    pictogram: 'pictograma-archivo-descargar',
    action: () => {
      notifyDownloadChild();
    },
  },
]);
</script>
<template>
  <!-- El contenido de la tarjeta de capas  -->
  <div class="m-b-5">
    <p class="tarjeta-titulo m-y-2">
      {{ selectedElement.title }}
    </p>
    <p class="tarjeta-etiqueta">Variables disponibles</p>
  </div>

  <div class="flex flex-contenido-final">
    <button
      v-for="button in optionsButtons"
      class="boton-pictograma boton-sin-contenedor-secundario"
      :aria-label="button.label"
      type="button"
      @click="button.action"
    >
      <span :class="button.pictogram" aria-hidden="true" />
    </button>
  </div>
  <!-- Los modales-->
  <ConsultaModalTabla ref="tablaChild" :selected-element="selectedElement" />
  <ConsultaModalDescarga
    ref="downloadChild"
    :resource-type="resourceType"
    :selected-element="selectedElement"
    :download-type="'individual'"
  />
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
