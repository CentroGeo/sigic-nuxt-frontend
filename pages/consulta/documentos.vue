<script setup>
const resourceType = 'document';

const storeConsulta = useConsultaStore();
const storeFetched = useFetchedResourcesStore();
const storeSelected = useSelectedResources2Store();
storeConsulta.resourceType = resourceType;

const route = useRoute();
const router = useRouter();

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
  // console.log('recursos tablas:', storeSelected[resourceType]);
}

onMounted(() => {
  updateStoreFromQuery(route.query.recursos);
  // Para cuando hacemos el cambio de página
  if (storeSelected.uuids.length > 0) {
    updateQueryFromStore(storeSelected.asQueryParam());
  }
});
/* async function obtenerPDFs() {
  const res = await fetch(`${config.public.geonodeApi}/api/v2/documents/`);
  const data = await res.json();
  const docs = data.results;

  docs.forEach((doc) => {
    console.log(`Título: ${doc.title}`);
    console.log(`Descargar: ${config.public.geonodeApi}${doc.download_url}`);
  });
}
obtenerPDFs(); */
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo
        titulo="Documentos"
        :resource-type="resourceType"
        etiqueta-elementos="Documentos"
      />
    </template>

    <template #visualizador>
      <div
        v-if="storeSelected.uuids.length === 0 || storeFetched[resourceType].length === 0"
        class="contenedor"
      >
        <h1>No hay seleccion</h1>
      </div>
      <ConsultaVisualizacionDocumento v-else />
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
