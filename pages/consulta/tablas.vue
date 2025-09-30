<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const storeConsulta = useConsultaStore();
const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();

storeConsulta.resourceType = resourceTypeDic.dataTable;
const resourceType = resourceTypeDic.dataTable;

const route = useRoute();
const router = useRouter();

const paginaActual = ref(0);
const tamanioPagina = 10;
const selectedPk = computed(() => storeSelected.lastVisible()?.pk ?? null);
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

watch([() => selectedPk.value, () => storeResources.resourcesByType(resourceType)], () => {
  selectedElement.value = storeResources.findResources([selectedPk.value])[0];
  paginaActual.value = 0;
  // console.log(selectedPk.value);
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

onMounted(async () => {
  storeResources.resetByType(storeConsulta.resourceType);
  storeResources.getTotalResources(storeConsulta.resourceType);
  storeSelected.addFromQueryParam(route.query.tablas);

  // Para cuando hacem el cambio de página
  if (storeSelected.pks.length > 0) {
    updateQueryParam(storeSelected.asQueryParam());

    selectedElement.value = storeResources.findResources([selectedPk.value])[0];
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
      <template v-if="storeResources.isLoading">Cargando...</template>
      <div v-else-if="storeSelected.pks.length === 0" class="contenedor">
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
