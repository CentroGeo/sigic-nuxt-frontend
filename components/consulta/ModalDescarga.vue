<script setup>
import {
  downloadDocs,
  downloadMetadata,
  downloadNoGeometry,
  downloadRaster,
  downloadWMS,
} from '@/utils/consulta';
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
const selectedOption = ref();
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
  selectedOption.value = optionsList.value.map((d) => d.label)[0];
}

const layerOptions = {
  raster: [
    {
      label: 'GeoTiff',
      action: () => {
        downloadRaster(selectedElement.value);
      },
    },
    {
      label: 'Metadatos',
      action: () => {
        downloadMetadata(selectedElement.value);
      },
    },
  ],
  vector: [
    {
      label: 'GeoJson',
      action: () => {
        downloadWMS(selectedElement.value, 'geojson', 'all');
      },
    },
    {
      label: 'CSV',
      action: () => {
        downloadWMS(selectedElement.value, 'csv', 'all');
      },
    },
    {
      label: 'GeoPackage',
      action: () => {
        downloadWMS(selectedElement.value, 'gpkg', 'all');
      },
    },
    {
      label: 'KML',
      action: () => {
        downloadWMS(selectedElement.value, 'kml', 'all');
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
          downloadNoGeometry(selectedElement.value, 'csv');
        },
      },
      {
        label: 'XLS',
        action: () => {
          downloadNoGeometry(selectedElement.value, 'xls');
        },
      },
      {
        label: 'XLSX',
        action: () => {
          downloadNoGeometry(selectedElement.value, 'xlsx');
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
function descargarClicked() {
  optionsList.value.map((d) => {
    if (d.label === selectedOption.value) {
      d.action();
    }
  });
}
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
        <p class="h5">{{ selectedElement.title }}</p>
        <div>
          <div v-for="option in optionsList" :key="option.label">
            <input
              :id="`download-option-${option.label}`"
              v-model="selectedOption"
              :name="'opciones-descarga'"
              type="radio"
              :value="option.label"
            />

            <label :for="`download-option-${option.label}`">{{ option.label }} </label>
          </div>
          <div class="flex flex-contenido-final">
            <button type="button" class="boton-primario m-t-2" @click="descargarClicked">
              Descargar
            </button>
          </div>
          <!--           <div>
                      <button
              v-for="option in optionsList"
              :key="option.label"
              type="button"
              class="boton-secundario"
              @click="option.action"
              :disabled="option.label === 'GeoTiff' && !isLoggedIn"
            >
              {{ option.label }}
            </button> 
          </div> -->
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
.tarjeta {
  width: 99%;
  background-color: var(--color-alerta-1);
  border: 1px solid var(--color-alerta-3);
  p {
    color: var(--color-alerta-3);
  }
}
</style>
