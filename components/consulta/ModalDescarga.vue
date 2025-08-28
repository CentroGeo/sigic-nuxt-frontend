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
const { data } = useAuth();
const isLoggedIn = ref(data.value ? true : false);
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
        <!--         <div v-if="layerType === 'remote'" class="tarjeta m-y-3">
          <div class="tarjeta-cuerpo">
            <p>Esta capa es remota y no se puede descargar del geoserver</p>
          </div>
        </div> -->

        <!--         <div v-else> -->
        <div>
          <p>Formato:</p>
          <div>
            <button
              v-for="option in optionsList"
              :key="option.label"
              type="button"
              class="boton-secundario"
              :disabled="option.label === 'GeoTiff' && !isLoggedIn"
              @click="option.action"
            >
              {{ option.label }}
            </button>
          </div>

          <div v-if="selectedElement.subtype === 'raster' && !isLoggedIn" class="tarjeta m-y-3">
            <div class="tarjeta-cuerpo">
              <p>Para descargar archivos en formato GeoTiff es necesario iniciar sesión.</p>
            </div>
          </div>
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
