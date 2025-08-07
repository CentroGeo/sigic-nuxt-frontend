<script setup>
const resourcesStore = useSelectedResources2Store();
const fetchedStore = useFetchedResourcesStore();
const resourceType = 'dataTable';

const storeConsulta = useConsultaStore();
storeConsulta.resourceType = 'dataTable';

const paginaActual = ref(0);
const tamanioPagina = 10;
const selected = computed(
  () => resourcesStore[resourceType].filter((element) => element.isSelected === 1)[0] ?? null
);
const selectedUuid = computed(() => selected.value?.uuid ?? null);
const selectedElement = ref();

const route = useRoute();
const router = useRouter();

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

watch([() => selectedUuid.value, () => fetchedStore[resourceType]], () => {
  selectedElement.value = fetchedStore.findResources([selectedUuid.value], resourceType)[0];
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
watch(() => resourcesStore.resourcesAsQueryParam(resourceType), updateQueryFromStore);

/**
 * Actualiza el store desde los valores del queryParam.
 * @param queryParam que llega desde la url.
 */
function updateStoreFromQuery(queryParam) {
  resourcesStore.addFromQueryParam(queryParam, resourceType);
}

onMounted(() => {
  updateStoreFromQuery(route.query.recursos);
  // Para cuando hacemos el cambio de página
  if (resourcesStore[resourceType].length > 0) {
    updateQueryFromStore(resourcesStore.resourcesAsQueryParam(resourceType));
    selectedElement.value = fetchedStore.findResources([selectedUuid.value], resourceType)[0];
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
        v-if="resourcesStore[resourceType].length === 0 || fetchedStore[resourceType].length === 0"
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
