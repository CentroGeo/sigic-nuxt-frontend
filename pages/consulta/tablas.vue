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

/**
 * Actualiza el queryParam.
 * @param newQueryParam para asignar.
 */

function updateQueryParam(tablas) {
  if (tablas !== route.query.tablas) {
    router.replace({ query: { tablas } });
  }
}

watch(paginaActual, () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: selectedElement.value,
  });
});

watch(() => storeSelected.asQueryParam(), updateQueryParam);

watch(
  [
    () => selectedPk.value,
    () => storeResources.resourcesByType(resourceType),
    () => storeResources.selectedResources[resourceType],
  ],
  () => {
    selectedElement.value = storeResources.findResource(selectedPk.value);
    paginaActual.value = 0;
    fetchTable({
      paginaActual: paginaActual.value,
      tamanioPagina: tamanioPagina,
      resource: selectedElement.value,
    });
  },
  { deep: true }
);
onMounted(async () => {
  storeResources.resetByType(storeConsulta.resourceType);
  storeSelected.addFromQueryParam(route.query.tablas);

  // Para cuando hacemos el cambio de página
  if (storeSelected.pks.length > 0) {
    storeResources.fetchResourcesByPk(storeConsulta.resourceType, storeSelected.pks);
    updateQueryParam(storeSelected.asQueryParam());
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
        <ConsultaTarjetaSinSeleccion />
      </div>
      <div v-else class="fondo-color-neutro">
        <div class="contenedor-tabla">
          <UiPaginador
            :pagina-parent="paginaActual"
            :total-paginas="Math.ceil(totalFeatures / tamanioPagina)"
            @cambio="paginaActual = $event"
          />
          <h2 v-if="selectedElement" class="m-t-1 m-b-1 m-x-2">{{ selectedElement.title }}</h2>
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

.tabla {
  background-color: var(--color-neutro-2);
}
</style>
