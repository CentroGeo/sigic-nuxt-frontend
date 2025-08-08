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
const router = useRouter();
const selectedStore = useSelectedResources2Store();
const config = useRuntimeConfig();
const extent = ref([-118.3651, 14.5321, -86.7104, 32.7187]);
const estiloSeleccionado = ref("Opcion 1");
const estilosLista = ref(["Opcion 1", "Opción 2", "Opcion 3"]);
const modalMapa = ref(null);
const emit = defineEmits(["notifyDownload"]);

async function openLayerView() {
  console.log('agregar la capa al store correspondiente')
  //selectedStore.updateOtherResources(props.selectedElement.uuid, 'dataLayer')
/*   const uuids = selectedStore.uuids
  uuids.push(props.selectedElement.uuid);
  selectedStore.updateResources(uuids);*/
  await navigateTo('/consulta/capas'); 
}

function downloadClicked() {
  modalMapa.value?.cerrarModal();
  emit('notifyDownload');
}
function abrirModalMapa() {
  modalMapa.value?.abrirModal();
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
        <button type="button" class="boton-primario" @click="openLayerView">
          Abrir en Capas
        </button>

        <button type="button" class="boton-primario" @click="downloadClicked()">
          Descargar
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
