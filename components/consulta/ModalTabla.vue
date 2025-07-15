<script setup>
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
});
const { selectedElement } = toRefs(props);

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

watch(paginaActual, () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: selectedElement.value,
  });
});
</script>
<template>
  <UiTablaAccesible :variables="variables" :datos="datos" />
  <UiPaginador
    :totalPaginas="Math.ceil(totalFeatures / tamanioPagina)"
    @cambio="paginaActual = $event"
  />
</template>
