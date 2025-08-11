<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const resourceType = resourceTypeDic.dataTable;

const storeConsulta = useConsultaStore();
const storeFetched = useFetchedResourcesStore();
const storeSelected = useSelectedResources2Store();
storeConsulta.resourceType = resourceType;

const route = useRoute();
const router = useRouter();

const paginaActual = ref(0);
const tamanioPagina = 10;
const selectedUuid = computed(() => storeSelected.lastVisible()?.uuid ?? null);
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
  // console.log(selectedUuid.value);
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: selectedElement.value,
  });
});

/**
 * Actualiza el queryParam.
 * @param newQueryParam para asignar.
 */
function updateQueryParam(tablas) {
  if (tablas !== route.query.tablas) {
    router.replace({ query: { tablas } });
  }
}
watch(() => storeSelected.asQueryParam(), updateQueryParam);

onMounted(() => {
  storeSelected.addFromQueryParam(route.query.tablas);

  // Para cuando hacem el cambio de página
  if (storeSelected.uuids.length > 0) {
    updateQueryParam(storeSelected.asQueryParam());

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
