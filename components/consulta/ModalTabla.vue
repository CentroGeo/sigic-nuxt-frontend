<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { resourceTypeDic } from '~/utils/consulta';
import SelectedResource from '~/utils/consulta/SelectedResource';

const emit = defineEmits(['notifyDownload']);
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});

const modalTabla = ref(null);
const paginaActual = ref(0);
const tamanioPagina = 10;
const {
  variables,
  datos,
  totalFeatures,
  refetch: fetchTable,
} = useGeoserverDataTable({
  paginaActual: paginaActual.value,
  tamanioPagina: tamanioPagina,
  resource: props.selectedElement,
});

function abrirModalTabla() {
  modalTabla.value?.abrirModal();
}

async function openTablas() {
  // modalTabla.value?.cerrarModal();
  useSelectedResources2Store().add(
    new SelectedResource({ uuid: props.selectedElement.uuid }),
    resourceTypeDic.dataTable
  );

  await navigateTo('/consulta/tablas');
}

defineExpose({
  abrirModalTabla,
});

watch([paginaActual], () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: props.selectedElement,
  });
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal id="modal-tabla" ref="modalTabla">
      <template #encabezado>
        <h1>{{ props.selectedElement.title }}</h1>
      </template>

      <template #cuerpo>
        <UiTablaAccesible :variables="variables" :datos="datos" />
        <UiPaginador
          :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
          @cambio="paginaActual = $event"
        />
      </template>

      <template #pie>
        <button type="button" class="boton-primario" @click="openTablas">Abrir en Tablas</button>

        <button type="button" class="boton-primario" @click="emit('notifyDownload')">
          Descargar
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
#modal-tabla {
  max-height: 70%;
}
</style>
