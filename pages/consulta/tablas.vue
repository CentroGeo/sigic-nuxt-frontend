<script setup>
const resourceType = 'dataTable';

const storeConsulta = useConsultaStore();
const storeFetched = useFetchedResourcesStore();
const storeSelected = useSelectedResources2Store();
storeConsulta.resourceType = resourceType;

const route = useRoute();
const router = useRouter();

const paginaActual = ref(0);
const tamanioPagina = 10;
const selectedUuid = computed(() => storeSelected.selectedOnes()[0]?.uuid ?? null);
const selectedElement = ref();

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

watch([() => selectedUuid.value, () => storeFetched[resourceType]], () => {
  selectedElement.value = storeFetched.findResources([selectedUuid.value], resourceType)[0];
  paginaActual.value = 0;
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: selectedElement.value,
  });
});

/**
 * Actualiza el queryParam desde los valores del store.
 * @param queryParam generado por el store.
 */
function updateQueryFromStore(queryParam) {
  const query = { recursos: queryParam };

  if (query.recursos !== route.query.recursos) {
    router.replace({ query });
  }
}
watch(() => storeSelected.asQueryParam(), updateQueryFromStore);

/**
 * Actualiza el store desde los valores del queryParam.
 * @param queryParam que llega desde la url.
 */
function updateStoreFromQuery(queryParam) {
  storeSelected.addFromQueryParam(queryParam);
  // console.log('recursos tablas:', storeSelected.list());
}

onMounted(() => {
  updateStoreFromQuery(route.query.recursos);
  // Para cuando hacemos el cambio de página
  if (storeSelected.uuids.length > 0) {
    updateQueryFromStore(storeSelected.asQueryParam());
    selectedElement.value = storeFetched.findResources([selectedUuid.value], resourceType)[0];
    fetchTable({
      paginaActual: paginaActual.value,
      tamanioPagina: tamanioPagina,
      resource: selectedElement.value,
    });
  }
});
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo
        titulo="Tabulados de datos"
        :resource-type="resourceType"
        etiqueta-elementos="Datos tabulados"
      />
    </template>

    <template #visualizador>
      <div
        v-if="storeSelected.uuids.length === 0 || storeFetched[resourceType].length === 0"
        class="contenedor"
      >
        <h1>No hay seleccion</h1>
      </div>
      <div v-else>
        <UiTablaAccesible :variables="variables" :datos="datos" :caption="'una descripción'" />
        <UiPaginador
          :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
          @cambio="paginaActual = $event"
        />
      </div>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Tabulados de datos"
        :resource-type="resourceType"
        etiqueta-elementos="Datos tabulados"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>
