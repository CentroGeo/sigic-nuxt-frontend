<script setup>
const props = defineProps({
  groupName: { type: String, required: true },
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const resourcesStore = useSelectedResources2Store()
const {groupName, selectedElement, resourceType } = toRefs(props);
const hasGeometry = ref();
const noGeometry = [-1, -1, 0, 0];
const mapChild = ref(null);
const downloadChild = ref(null);
console.log(selectedElement.value)
if (resourceType.value === "dataTable") {
  let a = selectedElement.value.extent.coords.join(",");
  let b = noGeometry.join(",");
  if (a === b) {
    hasGeometry.value = false;
  } else {
    hasGeometry.value = true;
  }
} else {
  hasGeometry.value = false;
}

function notifyMapChild() {
  mapChild.value?.abrirModalMapa();
}
function notifyDownloadChild() {
  downloadChild.value?.abrirModalDescarga();
}
function downloadFromMap() {
  console.log("el padre se enteró");
  downloadChild.value?.abrirModalDescarga();
}
</script>

<template>
  <div>
   <div>
      <input
        :id="selectedElement.uuid"
        type="radio"
        :name="groupName"
        :value="selectedElement.uuid"
      />
      <label :for="selectedElement.uuid">{{ selectedElement.title }}</label>
    </div> 
    <div class="flex flex-contenido-final">
      <button
        v-if="hasGeometry"
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Abrir vista previa"
        type="button"
        @click="notifyMapChild"
      >
        <span class="pictograma-capas" aria-hidden="true"></span>
      </button>
      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Borrar selección"
        type="button"
        @click="resourcesStore.removeResource(resourceType, selectedElement.uuid)"
      >
        <span class="pictograma-eliminar" aria-hidden="true" />
      </button>
      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Descargar selección"
        type="button"
        @click="notifyDownloadChild"
      >
        <span class="pictograma-archivo-descargar" aria-hidden="true" />
      </button>
    </div>
  </div>

   <ConsultaModalDescarga
    ref="downloadChild"
    :resource-type="resourceType"
    :selected-element="selectedElement"
    :download-type="'individual'"
  />
  <ConsultaModalMapa
    ref="mapChild"
    :selected-element="selectedElement"
    @clickDownload="downloadFromMap"
  /> 
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
