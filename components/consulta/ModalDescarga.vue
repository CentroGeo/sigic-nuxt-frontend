<script setup>
import { downloadMetadata, downloadPDF, downloadVectorData } from '@/utils/consulta';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
const props = defineProps({
  resourceType: { type: String, required: true },
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { resourceType, selectedElement } = toRefs(props);
const modalDescarga = ref(null);
const optionsList = ref(null);
const tagTitle = ref();

function abrirModalDescarga() {
  modalDescarga.value?.abrirModal();
  optionsList.value = optionsDict[resourceType.value]['elements'];
  tagTitle.value = optionsDict[resourceType.value]['title'];
}

const optionsDict = {
  dataLayer: {
    title: 'capa',
    elements: [
      {
        label: 'GeoJson',
        action: () => {
          downloadVectorData(selectedElement.value, 'geojson');
        },
      },
      {
        label: 'CSV',
        action: () => {
          downloadVectorData(selectedElement.value, 'csv');
        },
      },
      /*       {
        label: "XLS",
        action: () => {
          downloadExcel(selectedElement.value, 'xls');
        },
      },
      {
        label: 'XLSX',
        action: () => {
          downloadExcel(selectedElement.value, 'xlsx');
        },
      }, */
      {
        label: 'GeoPackage',
        action: () => {
          downloadVectorData(selectedElement.value, 'gpkg');
        },
      },
      {
        label: 'KML',
        action: () => {
          downloadVectorData(selectedElement.value, 'kml');
        },
      },
      {
        label: 'Metadatos',
        action: () => {
          downloadMetadata(selectedElement.value);
        },
      },
    ],
  },
  dataTable: {
    title: 'archivo',
    elements: [
      {
        label: 'CSV',
        action: () => {
          downloadVectorData(selectedElement.value, 'csv');
        },
      },
      /*       {
        label: "XLS",
        action: () => {
          downloadExcel(selectedElement.value, 'xls');
        },
      },
      {
        label: 'XLSX',
        action: () => {
          downloadExcel(selectedElement.value, 'xlsx');
        },
      }, */
      {
        label: 'Metadatos',
        action: () => {
          downloadMetadata(selectedElement.value);
        },
      },
    ],
  },
  document: {
    title: 'documento',
    elements: [
      {
        label: 'PDF',
        action: () => {
          downloadPDF(selectedElement.value);
        },
      },
      {
        label: 'Metadatos',
        action: () => {
          downloadMetadata(selectedElement.value);
        },
      },
    ],
  },
};
defineExpose({
  abrirModalDescarga,
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalDescarga">
      <template #encabezado>
        <h1>Descargar {{ tagTitle }}</h1>
      </template>
      <template #cuerpo>
        <p>{{ selectedElement.title }}</p>
        <p>Formato:</p>
        <div>
          <button
            v-for="option in optionsList"
            :key="option.label"
            type="button"
            class="boton-secundario"
            @click="option.action"
          >
            {{ option.label }}
          </button>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
.boton-secundario {
  width: 90%;
  margin: 8px;
}
</style>
