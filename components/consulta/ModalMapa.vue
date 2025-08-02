<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiSelector from "@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue";
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
const estiloSeleccionado = ref("Opcion 1");
const estilosLista = ref(["Opcion 1", "Opción 2", "Opcion 3"]);
const modalMapa = ref(null);
const emit = defineEmits(["clickDownload"]);
function abrirModalMapa() {
  modalMapa.value?.abrirModal();
}
function openLayerView() {
  resourcesStore.addResource("dataLayer", selectedElement.value);
  modalMapa.value?.cerrarModal();
  console.log("Redirije al visor de capas");
}
function notifyDownload() {
  console.log(
    "se hizo click en download, se triggerea el custom emit para notificar al padre"
  );
  emit("clickDownload");
  modalMapa.value?.cerrarModal();
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
        <SisdaiSelector
          v-model="estiloSeleccionado"
          etiqueta="Selecciona un estilo disponible"
          instruccional="Selecciona el estilo para visualizar"
        >
          <option
            v-for="(estilo, index) in estilosLista"
            :key="`estilo-${index}`"
            :value="estilo"
          >
            {{ estilo }}
          </option>
        </SisdaiSelector>

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
        <nuxtLink to="/consulta/capas">
          <button type="button" class="boton-primario" @click="openLayerView">
            Abrir en Capas
          </button>
        </nuxtLink>

        <button type="button" class="boton-primario" @click="notifyDownload">
          Descargar
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
