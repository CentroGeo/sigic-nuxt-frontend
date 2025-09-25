<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const storeConsulta = useConsultaStore();
const storeResources = useResourcesConsultaStore();
storeConsulta.resourceType = resourceTypeDic.document;
const resourceType = resourceTypeDic.document;

onMounted(async () => {
  storeResources.resetByType(storeConsulta.resourceType);
  storeResources.getTotalResources(storeConsulta.resourceType);
});
/* import { resourceTypeDic } from '~/utils/consulta';



const storeConsulta = useConsultaStore();
//const storeFetched = useFetchedResourcesStore();
const storeFetched = useFetchedResources2Store();
const storeSelected = useSelectedResources2Store();

storeFetched.checkFilling();

const route = useRoute();
const router = useRouter();

/**
 * Actualiza el queryParam desde los valores del store.
 * @param queryParam generado por el store.
 */
/*
function updateQueryFromStore(queryParam) {
  const query = { docs: queryParam };

  if (query.docs !== route.query.docs) {
    router.replace({ query });
  }
}
watch(() => storeSelected.asQueryParam(), updateQueryFromStore);

onMounted(() => {
  storeSelected.addFromQueryParam(route.query.docs);

  // Para cuando hacemos el cambio de página
  if (storeSelected.uuids.length > 0) {
    updateQueryFromStore(storeSelected.asQueryParam());
  }
}); */
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo titulo="Documentos" etiqueta-elementos="Documentos" />
    </template>

    <template #visualizador>
      <!--       <template v-if="storeFetched.isLoading">Cargando...</template>
      <div v-else-if="storeSelected.uuids.length === 0" class="contenedor">
        <h1>No hay seleccion</h1>
      </div>
      <ConsultaVisualizacionDocumento v-else /> -->
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Documentos seleccionados"
        :resource-type="resourceType"
        etiqueta-elementos="Documentos"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>

<style scoped>
.documento-embebido {
  width: 100%;
  height: 100%;
}
</style>
