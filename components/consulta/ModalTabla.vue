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
const isLoading = ref(true);
const paginaActual = ref(0);
const tamanioPagina = 6;
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
  useSelectedResources2Store().reset();
  useSelectedResources2Store().add(
    new SelectedResource({ pk: props.selectedElement.pk }),
    resourceTypeDic.dataTable
  );

  await navigateTo('/consulta/tablas');
}

defineExpose({
  abrirModalTabla,
});

watch(datos, () => {
  isLoading.value = false;
});

watch([paginaActual], async () => {
  isLoading.value = true;
  await fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: props.selectedElement,
  });
  isLoading.value = false;
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal id="modal-tabla" ref="modalTabla">
      <template #encabezado>
        <h1 class="title">{{ props.selectedElement.title }}</h1>
      </template>

      <template v-if="isLoading" #cuerpo>
        <div class="flex flex-contenido-centrado">
          <img
            src="/img/loader.gif"
            class="color-invertir"
            alt="...Cargando"
            heigh="120px"
            width="120px"
          />
        </div>
      </template>

      <template v-else #cuerpo>
        <div class="contenedor-tabla">
          <UiPaginador
            :pagina-parent="paginaActual"
            :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
            @cambio="paginaActual = $event"
          />
          <UiTablaAccesible :variables="variables" :datos="datos" />
        </div>
      </template>

      <template v-if="props.selectedElement.sourcetype !== 'REMOTE' && !isLoading" #pie>
        <button
          type="button"
          aria-label="Ver Tabla en Visualizador"
          class="boton-con-contenedor-secundario boton-grande ancho"
          @click="openTablas"
        >
          Ver Tabla en Visualizador
          <span aria-hidden="true" class="pictograma-previsualizar"></span>
        </button>
        <button
          type="button"
          aria-label="Descargar"
          class="boton-primario boton-grande ancho"
          @click="emit('notifyDownload')"
        >
          Descarga Archivo
          <span aria-hidden="true" class="pictograma-archivo-descargar pictograma-grande"></span>
        </button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
#modal-tabla {
  max-width: 40%;
  margin-top: 64px;
}
.contenedor-tabla {
  overflow-y: auto;
}
.ancho {
  width: 50%;
  display: flex;
  justify-content: center;
}

.title {
  text-overflow: ellipsis;
  overflow: hidden;
  height: 1.2em;
  white-space: nowrap;
}
</style>
