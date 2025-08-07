<script setup>
import {
  downloadMetadata,
  downloadPDF,
  downloadVectorData,
  wait,
} from "@/utils/consulta.js";
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
const resourcesStore = useSelectedResources2Store();
const props = defineProps({
  resourceType: { type: String, required: true },
});
const { resourceType } = toRefs(props);
const modalDescargaAll = ref(null);
const optionsList = ref(null);
const tagTitle = ref();

function abrirModalDescargaAll() {
  modalDescargaAll.value?.abrirModal();
  optionsList.value = optionsDict[resourceType.value]['elements'];
  tagTitle.value = optionsDict[resourceType.value]['title'];
}

async function downloadAllCSV() {
  const resourceList = resourcesStore[resourceType.value];
  for (let i = 0; i < resourceList.length; i++) {
    await downloadVectorData(resourceList[i], 'csv');
    await wait(1000);
  }
  modalDescargaAll.value?.cerrarModal();
}
async function downloadAllPDF() {
  const resourceList = resourcesStore[resourceType.value];
  for (let i = 0; i < resourceList.length; i++) {
    downloadPDF(resourceList[i]);
    await wait(1000);
  }
  modalDescargaAll.value?.cerrarModal();
}

async function downloadAllMetadata() {
  const resourceList = resourcesStore[resourceType.value];
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
          downloadAllCSV();
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
        label: 'PDF',
        action: () => {
          downloadAllPDF();
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
