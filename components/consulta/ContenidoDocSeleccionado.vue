<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import {
  downloadVectorData,
  downloadMetadata,
  downloadPDF,
} from "@/utils/consulta.js";

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
const modalDescargaDoc = ref(null);
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
        @click="modalDescargaDoc?.abrirModal()"
      >
        <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
      </button>
    </div>
  </div>

  <SisdaiModal ref="modalDescargaDoc">
    <template #encabezado>
      <h1>Descargar documento</h1>
    </template>
    <template #cuerpo>
      <p>{{ selectedElement.title }}</p>
      <div>
        <button
          v-if="resourceType !== 'document'"
          type="button"
          class="boton-secundario"
          @click="downloadVectorData(selectedElement, 'csv')"
        >
          CSV
        </button>
        <button
          v-if="resourceType === 'document'"
          type="button"
          class="boton-secundario"
          @click="downloadPDF(selectedElement)"
        >
          PDF
        </button>
        <button
          type="button"
          class="boton-secundario"
          @click="downloadMetadata(selectedElement)"
        >
          Metadatos
        </button>
      </div>
    </template>
  </SisdaiModal>
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
.boton-secundario {
  width: 90%;
  margin: 8px;
}
</style>
