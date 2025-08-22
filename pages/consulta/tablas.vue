<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const resourceType = resourceTypeDic.dataTable;

const storeConsulta = useConsultaStore();
const storeFetched = useFetchedResources2Store();
const storeSelected = useSelectedResources2Store();

storeConsulta.resourceType = resourceType;
storeFetched.checkFilling();

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

watch([() => selectedUuid.value, () => storeFetched.byResourceType(resourceType)], () => {
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
      <ConsultaLayoutCatalogo titulo="Tabulados de datos" etiqueta-elementos="Datos tabulados" />
    </template>

    <template #visualizador>
      <template v-if="storeFetched.isLoading">Cargando...</template>
      <div v-else-if="storeSelected.uuids.length === 0" class="contenedor">
        <h1>No hay seleccion</h1>
      </div>
      <div v-else>
        <div class="contenedor-tabla">
          <UiPaginador
            :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
            @cambio="paginaActual = $event"
          />
          <h2 v-if="selectedElement" class="m-t-1 m-b-0 m-x-2">{{ selectedElement.title }}</h2>
          <UiTablaAccesible class="tabla" :variables="variables" :datos="datos" />
        </div>
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
<style scoped>
.contenedor-tabla {
  height: var(--altura-consulta-esc);
}
</style>
