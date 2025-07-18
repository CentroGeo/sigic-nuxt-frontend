<script setup>
import { downloadDataTable } from "@/utils/consulta.js";

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
      >
        <a
          target="_blank"
          :href="
            resourceType === 'document'
              ? selectedElement.download_url
              : downloadDataTable(selectedElement)
          "
        >
          <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
        </a>
      </button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
button {
  a {
    text-decoration: none;
    color: var(--color-secundario-8);
  }
}
</style>
