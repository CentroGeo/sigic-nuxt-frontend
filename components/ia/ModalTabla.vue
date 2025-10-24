<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});

const modalTabla = ref(null);
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
    <SisdaiModal id="modal-tabla-ia" ref="modalTabla" class="modal-grande">
      <template #encabezado>
        <h2>{{ props.selectedElement.title }}</h2>
      </template>

      <template #cuerpo>
        <div v-if="datos.length === 0" class="flex flex-contenido-centrado">
          <figure>
            <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
            <figcaption class="texto-centrado">Cargando recurso</figcaption>
          </figure>
        </div>
        <div v-else class="contenedor-tabla">
          <UiPaginador
            :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
            @cambio="paginaActual = $event"
          />
          <UiTablaAccesible :variables="variables" :datos="datos" />
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.contenedor-tabla {
  overflow-y: auto;
}
</style>
