<script setup>
import { downloadDocs, downloadMetadata, downloadNoGeometry, wait } from '@/utils/consulta';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const storeSelected = useSelectedResources2Store();
const storeFetched = useFetchedResources2Store();

const props = defineProps({
  resourceType: { type: String, required: true },
});
const modalDescargaAll = ref(null);
const optionsList = ref(null);
const selectedOption = ref();
const tagTitle = ref();
/* const includesRemote = computed(() =>
  storeFetched
    .findResources(storeSelected.uuids)
    .map((resource) => resource.sourcetype)
    .includes('REMOTE')
); */

function abrirModalDescargaAll() {
  modalDescargaAll.value?.abrirModal();
  optionsList.value = optionsDict[props.resourceType]['elements'];
  tagTitle.value = optionsDict[props.resourceType]['title'];
  selectedOption.value = optionsList.value.map((d) => d.label)[0];
  console.log(selectedOption.value);
}

async function downloadAllDataTables(format) {
  const resourceList = storeFetched.findResources(storeSelected.uuids);
  for (let i = 0; i < resourceList.length; i++) {
    if (resourceList[i].sourcetype !== 'REMOTE') {
      await downloadNoGeometry(resourceList[i], format);
      await wait(1000);
    }
  }
  modalDescargaAll.value?.cerrarModal();
}

async function downloadAllDocs() {
  const resourceList = storeFetched.findResources(storeSelected.uuids);
  for (let i = 0; i < resourceList.length; i++) {
    if (resourceList[i].sourcetype !== 'REMOTE') {
      downloadDocs(resourceList[i]);
      await wait(1000);
    }
  }
  modalDescargaAll.value?.cerrarModal();
}

async function downloadAllMetadata() {
  const resourceList = storeFetched.findResources(storeSelected.uuids);
  for (let i = 0; i < resourceList.length; i++) {
    if (resourceList[i].sourcetype !== 'REMOTE') {
      await downloadMetadata(resourceList[i]);
      await wait(1000);
    }
  }
  modalDescargaAll.value?.cerrarModal();
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
          <button type="button" class="boton-primario m-t-2" @click="descargarAllClicked">
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
</style>
