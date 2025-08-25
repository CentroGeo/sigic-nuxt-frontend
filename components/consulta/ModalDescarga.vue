<script setup>
import { downloadDocs, downloadMetadata, downloadWMS } from '@/utils/consulta';
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
const docExtension = ref(
  resourceType.value === 'document'
    ? selectedElement.value.links.find((link) => link.link_type === 'uploaded').extension
    : 'No aplica'
);
const layerType = ref(
  resourceType.value === 'dataLayer' ? selectedElement.value.subtype : 'No aplica'
);

function abrirModalDescarga() {
  modalDescarga.value?.abrirModal();
  optionsList.value = optionsDict[resourceType.value]['elements'];
  tagTitle.value = optionsDict[resourceType.value]['title'];
}

const layerOptions = {
  raster: [
    {
      label: 'GeoTiff',
      action: () => {
        console.warn('descargar Geotiff');
        console.warn(selectedElement.value);
      },
    },
    {
      label: 'Metadatos',
      action: () => {
        console.warn('Descarga metadatos de raster');
      },
    },
  ],
  vector: [
    {
      label: 'GeoJson',
      action: () => {
        downloadWMS(selectedElement.value, 'geojson');
      },
    },
    {
      label: 'CSV',
      action: () => {
        downloadWMS(selectedElement.value, 'csv');
      },
    },
    {
      label: 'GeoPackage',
      action: () => {
        downloadWMS(selectedElement.value, 'gpkg');
      },
    },
    {
      label: 'KML',
      action: () => {
        downloadWMS(selectedElement.value, 'kml');
      },
    },
    {
      label: 'Metadatos',
      action: () => {
        downloadMetadata(selectedElement.value);
      },
    },
  ],
  remote: [],
};
const optionsDict = {
  dataLayer: {
    title: 'capa',
    elements: layerOptions[layerType.value],
  },
  dataTable: {
    title: 'archivo',
    elements: [
      {
        label: 'CSV',
        action: () => {
          downloadWMS(selectedElement.value, 'csv');
        },
      },
      {
        label: 'XLS',
        action: () => {
          downloadWMS(selectedElement.value, 'xls');
        },
      },
      {
        label: 'XLSX',
        action: () => {
          downloadWMS(selectedElement.value, 'xlsx');
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
  document: {
    title: 'documento',
    elements: [
      {
        label: docExtension.value === 'pdf' ? 'PDF' : 'TXT',
        action: () => {
          downloadDocs(selectedElement.value);
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
        <div v-if="layerType === 'remote'">
          Esta capa es remota y no se puede descargar del geoserver
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
