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
    <SisdaiModal id="modal-mapa" ref="modalMapa">
      <template #encabezado>
        <h1>{{ selectedElement.title }}</h1>
      </template>

      <template #cuerpo>
        <SisdaiSelector
          v-model="estiloSeleccionado"
          etiqueta="Variables disponibles para visualizar"
          instruccional="Selecciona el estilo para visualizar"
          class="m-y-2"
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
        <button
          type="button"
          class="boton-con-contenedor-secundario boton-grande ancho"
          @click="openLayerView"
        >
          Ver Capa en Visualizador
          <span aria-hidden="true" class="pictograma-previsualizar"></span>
        </button>
        <button type="button" class="boton-primario boton-grande ancho" @click="downloadClicked()">
          Descarga Archivo
          <span aria-hidden="true" class="pictograma-archivo-descargar pictograma-grande"></span>
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
#modal-mapa {
  max-width: 40%;
}

.ancho {
  width: 50%;
  display: flex;
  justify-content: center; /* horizontal center */
}
</style>
