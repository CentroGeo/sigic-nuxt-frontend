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
const tagTitle = ref();

function abrirModalDescargaAll() {
  modalDescargaAll.value?.abrirModal();
  optionsList.value = optionsDict[props.resourceType]['elements'];
  tagTitle.value = optionsDict[props.resourceType]['title'];
}

async function downloadAllDataTables(format) {
  const resourceList = storeFetched.findResources(storeSelected.uuids);
  for (let i = 0; i < resourceList.length; i++) {
    await downloadNoGeometry(resourceList[i], format);
    await wait(1000);
  }
  modalDescargaAll.value?.cerrarModal();
}

async function downloadAllDocs() {
  const resourceList = storeFetched.findResources(storeSelected.uuids);
  for (let i = 0; i < resourceList.length; i++) {
    downloadDocs(resourceList[i]);
    await wait(1000);
  }
  modalDescargaAll.value?.cerrarModal();
}

async function downloadAllMetadata() {
  const resourceList = storeFetched.findResources(storeSelected.uuids);
  for (let i = 0; i < resourceList.length; i++) {
    await downloadMetadata(resourceList[i]);
    await wait(1000);
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
