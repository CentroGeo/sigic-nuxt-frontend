<script setup>
const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  groupName: { type: String, required: true },
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);
const shownFileUuid = computed(
  () => resourcesStore.shownFiles[resourceType.value].uuid
);
const hasGeometry = ref();
const noGeometry = [-1, -1, 0, 0];
const mapPreview = ref(null);
const downloadChild = ref(null);

function notifyMapPreview() {
  mapPreview.value?.abrirModalMapa();
}
function notifyDownloadChild() {
  downloadChild.value?.abrirModalDescarga();
}

if (resourceType.value === "dataTable") {
  let a = selectedElement.value.extent.coords.join(",");
  let b = noGeometry.join(",");
  if (a === b) {
    hasGeometry.value = false;
  } else {
    hasGeometry.value = true;
  }
} else {
  hasGeometry.value = true;
}
</script>

<template>
  <div>
    <div @click="resourcesStore.setShownFile(resourceType, selectedElement)">
      <input
        :id="selectedElement.uuid"
        type="radio"
        :name="groupName"
        :value="selectedElement.uuid"
        v-model="shownFileUuid"
      />
      <label :for="selectedElement.uuid">{{ selectedElement.title }}</label>
    </div>

    <div class="flex flex-contenido-final">
      <button
        v-if="hasGeometry"
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Abrir vista previa"
        type="button"
        @click="notifyMapPreview"
      >
        <span class="pictograma-mexico" aria-hidden="true"></span>
      </button>
      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Borrar selección"
        type="button"
        @click="resourcesStore.removeResource(resourceType, selectedElement)"
      >
        <span class="pictograma-eliminar" aria-hidden="true"></span>
      </button>
      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Descargar selección"
        type="button"
        @click="notifyDownloadChild"
      >
        <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
      </button>
    </div>
  </div>

  <ConsultaModalDescarga
    ref="downloadChild"
    :resource-type="resourceType"
    :selected-element="selectedElement"
    :download-type="'individual'"
  />
  <ConsultaModalMapa ref="mapPreview" :selected-element="selectedElement" />
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
