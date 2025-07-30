<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { selectedElement } = toRefs(props);
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
  resource: selectedElement.value,
});

function abrirModalTabla() {
  modalTabla.value?.abrirModal();
}

defineExpose({
  abrirModalTabla,
});

watch(paginaActual, () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: selectedElement.value,
  });
});
</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalTabla">
      <template #encabezado>
        <h1>{{ selectedElement.title }}</h1>
      </template>

      <template #cuerpo>
        <UiTablaAccesible :variables="variables" :datos="datos" />
        <UiPaginador
          :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
          @cambio="paginaActual = $event"
        />
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
