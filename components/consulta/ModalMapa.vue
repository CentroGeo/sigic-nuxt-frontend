<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import {
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiMapa,
} from "@centrogeomx/sisdai-mapas";

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { selectedElement } = toRefs(props);
const resourcesStore = useSelectedResourcesStore();
const config = useRuntimeConfig();
const extent = ref([-118.3651, 14.5321, -86.7104, 32.7187]);
const modalMapa = ref(null);
function abrirModalMapa() {
  modalMapa.value?.abrirModal();
}
function openLayerView() {
  resourcesStore.addResource("dataLayer", selectedElement.value);
  console.log("Redirije al visor de capas");
}
defineExpose({
  abrirModalMapa,
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalMapa">
      <template #encabezado>
        <h1>{{ selectedElement.title }}</h1>
      </template>

      <template #cuerpo>
        <SisdaiMapa class="gema" :vista="{ extension: extent }">
          <SisdaiCapaXyz />

          <SisdaiCapaWms
            :capa="selectedElement.alternate"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            @alFinalizarCarga="extent = selectedElement.extent.coords"
          />
        </SisdaiMapa>
      </template>

      <template #pie>
        <button type="button" class="boton-primario" @click="openLayerView">
          Abrir en Capas
        </button>
        <button type="button" class="boton-primario">Descargar</button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
