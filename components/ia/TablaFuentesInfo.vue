<script setup>
const props = defineProps({
  selectedElementPk: {
    type: Number,
    default: null,
  },
});
const { selectedElementPk } = toRefs(props);

const storeResources = useResourcesIAStore();
const emit = defineEmits(['tablaCargada']);

const paginaActual = ref(0);
const tamanioPagina = 6;

const resourceByPk = ref();
resourceByPk.value = await storeResources.fetchResourceByPk(selectedElementPk.value);

const {
  variables,
  datos,
  totalFeatures,
  refetch: fetchTable,
} = useGeoserverDataTable({
  paginaActual: paginaActual.value,
  tamanioPagina: tamanioPagina,
  resource: resourceByPk.value,
});

watch([paginaActual], () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: resourceByPk.value,
  });
});

watch(datos, (nv) => {
  if (nv.length !== 0) {
    emit('tablaCargada');
  }
});

watch(selectedElementPk, async (nv) => {
  variables.value = [];
  datos.value = [];
  totalFeatures.value = 0;
  //
  resourceByPk.value = await storeResources.fetchResourceByPk(nv);
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: resourceByPk.value,
  });
});
</script>

<template>
  <div v-if="datos.length !== 0" class="contenedor-tabla">
    <UiPaginador
      :pagina-parent="paginaActual"
      :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
      @cambio="paginaActual = $event"
    />
    <UiTablaAccesible :variables="variables" :datos="datos" />
  </div>
</template>

<style lang="scss" scoped>
.contenedor-tabla {
  overflow-y: auto;
}
</style>
