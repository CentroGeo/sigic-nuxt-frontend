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
const emit = defineEmits(['descargaClicked', 'mapaClicked']);
const selectedResource = computed({
  get(){
    return resourcesStore[props.resourceType].filter((element) => element.isSelected === 1)[0]['uuid']
  },
  set(newSelectedUuid){
    resourcesStore.setSelectedElement(props.resourceType, newSelectedUuid)
  },
})
const hasGeometry = ref();
const noGeometry = [-1, -1, 0, 0];
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

</script>

<template>
  <div>
   <div>
      <input
        :id="selectedElement.uuid"
        type="radio"
        :name="groupName"
        :value="selectedElement.uuid"
        v-model="selectedResource"
      />
      <label :for="selectedElement.uuid">{{ selectedElement.title }}</label>
    </div> 
    <div class="flex flex-contenido-final">
      <button
        v-if="hasGeometry"
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Abrir vista previa"
        type="button"
        @click="emit('mapaClicked')"
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
        @click="emit('descargaClicked')"
      >
        <span class="pictograma-archivo-descargar" aria-hidden="true" />
      </button>
    </div>
  </div>

</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
