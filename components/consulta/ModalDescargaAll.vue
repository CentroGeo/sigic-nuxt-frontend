<script setup>
import { downloadDocs, downloadMetadata, downloadNoGeometry, wait } from '@/utils/consulta';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const storeSelected = useSelectedResources2Store();
const storeResources = useResourcesConsultaStore();

const props = defineProps({
  resourceType: { type: String, required: true },
});
const modalDescargaAll = ref(null);
const optionsList = ref(null);
const selectedOption = ref();
const tagTitle = ref();
const isDownloadActive = ref(false);
const hasDownloadFailed = ref(false);
const isDownloadSlow = ref(false);
const timer = 7000;
/* const includesRemote = computed(() =>
  storeResources
    .findResources(storeSelected.pks)
    .map((resource) => resource.sourcetype)
    .includes('REMOTE')
); */

function abrirModalDescargaAll() {
  isDownloadActive.value = false;
  hasDownloadFailed.value = false;
  isDownloadSlow.value = false;
  modalDescargaAll.value?.abrirModal();
  optionsList.value = optionsDict[props.resourceType]['elements'];
  tagTitle.value = optionsDict[props.resourceType]['title'];
  selectedOption.value = optionsList.value.map((d) => d.label)[0];
}

async function downloadAllDataTables(format) {
  isDownloadActive.value = true;
  const resourceList = storeResources.findResources(storeSelected.pks);
  const downloadStatusDict = {};
  //La siguiente línea se pone para agregar alerta si el proceso de descarga toma mas de n segundos
  const slowProcessTimeout = setTimeout(() => {
    isDownloadSlow.value = true;
  }, timer);
  for (let i = 0; i < resourceList.length; i++) {
    if (resourceList[i].sourcetype !== 'REMOTE') {
      const status = await downloadNoGeometry(resourceList[i], format);
      downloadStatusDict[resourceList[i].title] = status;
      await wait(1000);
    }
  }
  // Si toma menos de n segundos, se interrumple el timer
  clearTimeout(slowProcessTimeout);
  isDownloadSlow.value = false;

  const hasfailedDownloads = Object.values(downloadStatusDict).some((value) => value !== 'Ok');
  if (hasfailedDownloads) {
    hasDownloadFailed.value = true;
  }
  isDownloadActive.value = false;
  //modalDescargaAll.value?.cerrarModal();
}

async function downloadAllDocs() {
  isDownloadActive.value = true;
  const resourceList = storeResources.findResources(storeSelected.pks);
  const downloadStatusDict = {};
  //La siguiente línea se pone para agregar alerta si el proceso de descarga toma mas de n segundos
  const slowProcessTimeout = setTimeout(() => {
    isDownloadSlow.value = true;
  }, timer);

  for (let i = 0; i < resourceList.length; i++) {
    if (resourceList[i].sourcetype !== 'REMOTE') {
      const status = await downloadDocs(resourceList[i]);
      downloadStatusDict[resourceList[i].title] = status;
      await wait(1000);
    }
  }

  // Si toma menos de n segundos, se interrumple el timer
  clearTimeout(slowProcessTimeout);
  isDownloadSlow.value = false;
  const hasfailedDownloads = Object.values(downloadStatusDict).some((value) => value !== 'Ok');
  if (hasfailedDownloads) {
    hasDownloadFailed.value = true;
  }
  isDownloadActive.value = false;
  //modalDescargaAll.value?.cerrarModal();
}

async function downloadAllMetadata() {
  isDownloadActive.value = true;
  const resourceList = storeResources.findResources(storeSelected.pks);
  const downloadStatusDict = {};
  //La siguiente línea se pone para agregar alerta si el proceso de descarga toma mas de n segundos
  const slowProcessTimeout = setTimeout(() => {
    isDownloadSlow.value = true;
  }, timer);
  for (let i = 0; i < resourceList.length; i++) {
    if (resourceList[i].sourcetype !== 'REMOTE') {
      const status = await downloadMetadata(resourceList[i]);
      downloadStatusDict[resourceList[i].title] = status;
      await wait(1000);
    }
  }
  // Si toma menos de n segundos, se interrumple el timer
  clearTimeout(slowProcessTimeout);
  isDownloadSlow.value = false;

  const hasfailedDownloads = Object.values(downloadStatusDict).some((value) => value !== 'Ok');
  if (hasfailedDownloads) {
    hasDownloadFailed.value = true;
  }
  isDownloadActive.value = false;
  //modalDescargaAll.value?.cerrarModal();
}

const optionsDict = {
  dataTable: {
    title: 'archivos',
    elements: [
      {
        label: 'CSV',
        action: () => {
          downloadAllDataTables('csv');
        },
      },
      {
        label: 'XLS',
        action: () => {
          downloadAllDataTables('xls');
        },
      },
      {
        label: 'XLSX',
        action: () => {
          downloadAllDataTables('xlsx');
        },
      },
      {
        label: 'Metadatos',
        action: () => {
          downloadAllMetadata();
        },
      },
    ],
  },
  document: {
    title: 'documentos',
    elements: [
      {
        label: 'Archivos',
        action: () => {
          downloadAllDocs();
        },
      },
      {
        label: 'Metadatos',
        action: () => {
          downloadAllMetadata();
        },
      },
    ],
  },
};

function descargarAllClicked() {
  optionsList.value.map((d) => {
    if (d.label === selectedOption.value) {
      d.action();
    }
  });
}
defineExpose({
  abrirModalDescargaAll,
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modalDescargaAll">
      <template #encabezado>
        <h1>Descargar {{ tagTitle }}</h1>
      </template>
      <template #cuerpo>
        <!-- <div v-if="includesRemote" class="tarjeta m-y-3">  -->
        <div class="tarjeta m-y-3">
          <div class="tarjeta-cuerpo">
            <p>
              Solo se descargarán las capas públicas y las de Mis Archivos. Las capas de catálogos
              externos no pueden descargarse por restricciones de derechos de autor.
            </p>
          </div>
        </div>
        <div v-if="isDownloadActive" class="flex m-y-2 borde-redondeado-16 contenedor-proceso">
          <div class="columna-4 flex-vertical-centrado">
            <img src="/img/loader.gif" alt="...Cargando" class="loader" />
          </div>
          <p class="columna-12">
            Descarga en curso.
            <span v-if="isDownloadSlow">El proceso está tardando más tiempo de lo habitual.</span>
          </p>
        </div>
        <div
          v-if="hasDownloadFailed"
          class="flex m-y-2 borde-redondeado-16 contenedor-fallo flex-contenido-centrado"
        >
          <div class="columna-3 flex-vertical-centrado">
            <span class="pictograma-alerta pictograma-grande"></span>
          </div>
          <p class="columna-13">
            No se pudo completar la descarga de argunos archivos. Verifica tu conexión a internet e
            inténtalo de nuevo.
          </p>
        </div>
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
          <button
            type="button"
            aria-label="Descargar"
            class="boton-primario m-t-2"
            @click="descargarAllClicked"
          >
            Descargar
          </button>
        </div>
        <!--         <div>
          <button
            v-for="option in optionsList"
            :key="option.label"
            type="button"
            class="boton-secundario"
            @click="option.action"
          >
            {{ option.label }}
          </button>
        </div> -->
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
.contenedor-proceso {
  border: solid 1px var(--texto-informacion);
  gap: 8px;
  background-color: var(--color-informativo-1);
  color: var(--texto-informacion);
}
.contenedor-fallo {
  gap: 0px;
  border: solid 1px var(--texto-error);
  background-color: var(--color-error-1);
  color: var(--texto-error);
}
.loader {
  max-height: 3em;
  object-fit: scale-down;
}
</style>
