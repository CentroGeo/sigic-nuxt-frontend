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
</script>

<template>
  <div>
    <div @click="resourcesStore.setShownFile(resourceType, selectedElement)">
      <input :id="selectedElement.uuid" type="radio" :name="groupName" />
      <label :for="selectedElement.uuid">{{ selectedElement.title }}</label>
    </div>

    <div class="flex flex-contenido-final">
      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Remover selección"
        type="button"
        @click="resourcesStore.removeResource(resourceType, selectedElement)"
      >
        <span class="pictograma-eliminar" aria-hidden="true"></span>
      </button>
      <button
        class="boton-pictograma boton-sin-contenedor-secundario"
        aria-label="Descargar selección"
        type="button"
      >
        <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
      </button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
