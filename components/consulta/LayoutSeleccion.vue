<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import {
  downloadVectorData,
  downloadPDF,
  downloadMetadata,
} from "@/utils/consulta.js";
const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  titulo: { type: String, default: "Título" },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
  funcionDescarga: { type: Function, default: undefined },
});
const { titulo, resourceType } = toRefs(props);
const selectedStore = useSelectedResourcesStore();
const modalDescargaDoc = ref(null);
const buttonTagDict = {
  dataLayer: "mapa",
  dataTable: "archivos",
  document: "archivos",
};
function wait() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}
function downloadAllDocs() {
  modalDescargaDoc.value?.abrirModal();
}
async function downloadAllCSV() {
  let resourceList = resourcesStore.selectedResources[resourceType.value];
  for (let i = 0; i < resourceList.length; i++) {
    await downloadVectorData(resourceList[i], "csv");
    await wait();
  }
  modalDescargaDoc.value?.cerrarModal();
}
async function downloadAllPDF() {
  let resourceList = resourcesStore.selectedResources[resourceType.value];
  for (let i = 0; i < resourceList.length; i++) {
    downloadPDF(resourceList[i]);
    await wait();
  }
  modalDescargaDoc.value?.cerrarModal();
}

async function downloadAllMetadata() {
  let resourceList = resourcesStore.selectedResources[resourceType.value];
  for (let i = 0; i < resourceList.length; i++) {
    await downloadMetadata(resourceList[i]);
    await wait();
  }
  modalDescargaDoc.value?.cerrarModal();
}
</script>

<template>
  <div class="seleccion-layout">
    <div class="encabeado-seleccion">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

        <div class="flex m-y-3">
          <button
            type="button"
            class="boton-primario"
            aria-label="Descargar mapa"
            @click="
              resourceType === 'dataLayer' ? funcionDescarga : downloadAllDocs()
            "
          >
            Descargar {{ buttonTagDict[resourceType] }}
            <span class="pictograma-mapa-generador" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            aria-label="Compartir"
          >
            <span class="pictograma-compartir" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="boton-pictograma boton-con-contenedor-secundario"
            aria-label="Eliminar"
            @click="selectedStore.resetResource(resourceType)"
          >
            <span class="pictograma-eliminar" aria-hidden="true" />
          </button>
        </div>

        <UiNumeroElementos
          :numero="selectedStore.selectedResources[resourceType].length"
          :etiqueta="etiquetaElementos"
        />
      </div>
    </div>

    <div class="m-x-2 m-y-1">
      <ConsultaElementoSeleccionado
        v-for="resource in selectedStore.selectedResources[resourceType]"
        :key="`seleccion-${resource.uuid}`"
        :selected-element="resource"
        :resource-type="resourceType"
      />
    </div>

    <SisdaiModal ref="modalDescargaDoc">
      <template #encabezado>
        <h1>Descargar documentos</h1>
      </template>
      <template #cuerpo>
        <div>
          <button
            v-if="resourceType !== 'document'"
            type="button"
            class="boton-secundario"
            @click="downloadAllCSV"
          >
            CSV
          </button>
          <button
            v-if="resourceType === 'document'"
            type="button"
            class="boton-secundario"
            @click="downloadAllPDF"
          >
            PDF
          </button>
          <button
            type="button"
            class="boton-secundario"
            @click="downloadAllMetadata"
          >
            Metadatos
          </button>
        </div>
      </template>
    </SisdaiModal>
  </div>
</template>

<style lang="scss" scoped>
.seleccion-layout {
  height: var(--altura-consulta-esc);
  overflow-y: auto;
  overflow-x: hidden;

  .encabeado-seleccion {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--fondo);
    padding-bottom: 8px;
  }
}
.boton-secundario {
  width: 90%;
  margin: 8px;
}
</style>
