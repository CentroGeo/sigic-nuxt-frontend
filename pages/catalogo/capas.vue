<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const storeConsulta = useConsultaStore();
const storeFetched = useFetchedResourcesStore();

const resources = computed(() => storeFetched['dataLayer']);

const filteredResourcesCapas = ref({});
const variables = ref([]);
const datos = ref([]);

const obtenerRecursosFiltrados = async (resourceTypeLayer) => {
  storeConsulta.resourceType = resourceTypeLayer;
  const { resourcesList } = await useGeonodeResources();
  storeFetched.updateFetchedResources(resourceTypeLayer, resourcesList.value);
  return storeFetched[resourceTypeLayer];
};

onMounted(async () => {
  if (resources.value.length === 0) {
    storeFetched.isLoading = true;
    // dataLayer
    filteredResourcesCapas.value = await obtenerRecursosFiltrados(resourceTypeDic.dataLayer);
    storeFetched.isLoading = false;
  } else {
    filteredResourcesCapas.value = storeFetched['dataLayer'];
  }
  // groupResults();
  // obteniendo datos por las props que necesito
  datos.value = filteredResourcesCapas.value.map((d) => ({
    pk: d.pk,
    nombre: d.title,
    // tipo_recurso: d.resource_type,
    tipo_recurso: 'Capa geográfica',
    categoria: d.category,
    actualizacion: d.last_updated,
    acciones: 'Ver, Descargar',
    enlace_descarga: d.download_url,
  }));
  // obteniendo las variables de las keys
  variables.value = Object.keys(datos.value[0]);
});
// // TODO: fix tabla, filtros y paginador
// const resourcesStore = useSelectedResourcesStore();

// const recursosTipo = ref('dataLayer');
// const recursosFiltrados = ref([]);

// // dataLayer
// const recursosFiltradosCapas = ref([]);
// const variables = ref([]);
// const datos = ref([]);

// const { resourcesList: listaRecursosCapas } = useGeonodeResources({
//   resourceType: recursosTipo.value,
// });

// watch(listaRecursosCapas, () => {
//   resourcesStore.updateFilteredResources(recursosTipo.value, listaRecursosCapas.value);
// });
// watch(
//   () => resourcesStore.filteredResources[recursosTipo.value],
//   () => {
//     recursosFiltradosCapas.value = resourcesStore.filteredResources[recursosTipo.value];
//     // obteniendo datos por las props que necesito
//     datos.value = recursosFiltradosCapas.value.map((d) => ({
//       pk: d.pk,
//       nombre: d.title,
//       // tipo_recurso: d.resource_type,
//       tipo_recurso: 'Capa geográfica',
//       categoria: d.category,
//       actualizacion: d.last_updated,
//       acciones: 'Ver, Descargar',
//       enlace_descarga: d.download_url,
//     }));
//     // obteniendo las variables de las keys
//     variables.value = Object.keys(datos.value[0]);
//   },
//   { deep: true }
// );
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <!-- <CatalogoElementoFiltros
          :recursos-lista="recursosFiltrados"
          :recursos-tipo="recursosTipo"
        /> -->

        <div class="flex">
          <h2>Capas geográficas</h2>
          <UiNumeroElementos :numero="filteredResourcesCapas.length" />
        </div>

        <div class="flex">
          <div class="columna-15">
            <ClientOnly>
              <UiTablaAccesibleV2 :variables="variables" :datos="datos" />
              <UiPaginador :total-paginas="1" @cambio="1" />
            </ClientOnly>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
