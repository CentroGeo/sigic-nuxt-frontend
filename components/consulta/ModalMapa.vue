<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { resourceTypeDic } from '~/utils/consulta';
import SelectedLayer from '~/utils/consulta/SelectedLayer';

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const config = useRuntimeConfig();
const extentMap = ref(undefined);
const estilosLista = ref(['Opcion 1', 'Opción 2', 'Opcion 3']);
const estiloSeleccionado = ref(estilosLista.value[0]);
const modalMapa = ref(null);
const emit = defineEmits(['notifyDownload']);

async function openLayerView() {
  useSelectedResources2Store().add(
    new SelectedLayer({ uuid: props.selectedElement.uuid }),
    resourceTypeDic.dataLayer
  );

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
          <option v-for="(estilo, index) in estilosLista" :key="`estilo-${index}`" :value="estilo">
            {{ estilo }}
          </option>
        </SisdaiSelector>

        <SisdaiMapa class="gema" :vista="{ extension: extentMap }">
          <SisdaiCapaXyz />

          <SisdaiCapaWms
            :capa="selectedElement.alternate"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            @al-finalizar-carga="extentMap = selectedElement.extent.coords"
          />
        </SisdaiMapa>
      </template>

      <template #pie>
        <button type="button" class="boton-primario" @click="openLayerView">Abrir en Capas</button>

        <button type="button" class="boton-primario" @click="downloadClicked()">Descargar</button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
