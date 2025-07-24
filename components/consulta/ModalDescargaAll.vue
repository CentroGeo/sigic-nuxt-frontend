<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import {
  downloadVectorData,
  downloadPDF,
  downloadMetadata,
} from "@/utils/consulta.js";
const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  resourceType: { type: String, required: true },
});
const { resourceType } = toRefs(props);
const modalDescargaAll = ref(null);
const optionsList = ref(null);
const tagTitle = ref();

function abrirModalDescargaAll() {
  modalDescargaAll.value?.abrirModal();
  optionsList.value = optionsDict[resourceType.value]["elements"];
  tagTitle.value = optionsDict[resourceType.value]["title"];
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function downloadAllCSV() {
  let resourceList = resourcesStore.selectedResources[resourceType.value];
  for (let i = 0; i < resourceList.length; i++) {
    await downloadVectorData(resourceList[i], "csv");
    await wait();
  }
  modalDescargaAll.value?.cerrarModal();
}
async function downloadAllPDF() {
  let resourceList = resourcesStore.selectedResources[resourceType.value];
  for (let i = 0; i < resourceList.length; i++) {
    downloadPDF(resourceList[i]);
    await wait();
  }
  modalDescargaAll.value?.cerrarModal();
}

async function downloadAllMetadata() {
  let resourceList = resourcesStore.selectedResources[resourceType.value];
  for (let i = 0; i < resourceList.length; i++) {
    await downloadMetadata(resourceList[i]);
    await wait();
  }
  modalDescargaAll.value?.cerrarModal();
}

const optionsDict = {
  dataTable: {
    title: "archivos",
    elements: [
      {
        label: "CSV",
        action: () => {
          downloadAllCSV();
        },
      },
      {
        label: "Metadatos",
        action: () => {
          downloadAllMetadata();
        },
      },
    ],
  },
  document: {
    title: "documentos",
    elements: [
      {
        label: "PDF",
        action: () => {
          downloadAllPDF();
        },
      },
      {
        label: "Metadatos",
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
