<script setup>
// TODO: fix tabla, filtros y paginador
import { resourceTypeDic } from '~/utils/consulta';
const storeFetched = useFetchedResources2Store();
const storeFilters = useFilteredResources();
storeFetched.checkFilling(resourceTypeDic.dataLayer);
const resourcesCapas = computed(() => storeFetched.byResourceType(resourceTypeDic.dataLayer));

const filteredResources = ref([]);
const filteredResources2 = ref([]);

function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  filteredResources2.value = filteredResources.value.map((d) => ({
    pk: d.pk,
    titulo: d.title,
    // tipo_recurso: d.resource_type,
    tipo_recurso: 'Capa geográfica',
    categoria: d.category === null ? 'Sin clasificar' : d.category.gn_description,
    actualizacion: d.last_updated,
    acciones: 'Ver, Descargar',
    enlace_descarga: d.download_url,
  }));
  // filteredResources.value = nuevosRecursos;
  // groupResults();
}

watch([resourcesCapas], () => {
  // updateResources(storeFilters.filter())
  updateResources(storeFilters.sort());
});

onMounted(async () => {
  storeFilters.resetAll();
  if (resourcesCapas.value.length !== 0) {
    updateResources(resourcesCapas.value);
  }
});

// obteniendo datos por las props de la tabla
// const datos = computed(() =>
//   resourcesCapas.value.map((d) => ({
//     pk: d.pk,
//     titulo: d.title,
//     // tipo_recurso: d.resource_type,
//     tipo_recurso: 'Capa geográfica',
//     categoria: d.category,
//     actualizacion: d.last_updated,
//     acciones: 'Ver, Descargar',
//     enlace_descarga: d.download_url,
//   }))
// );
// obteniendo las variables keys para la tabla
// const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];
const variables = ['pk', 'titulo', 'actualizacion', 'categoria'];
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <CatalogoElementoFiltros
          :catalogo="filteredResources"
          @al-ordenar="(r) => updateResources(r)"
        />

        <div class="flex">
          <h2>Capas geográficas</h2>
          <UiNumeroElementos :numero="filteredResources.length" />
        </div>

        <div class="flex">
          <div class="columna-15">
            <ClientOnly>
              <UiTablaAccesibleV2 :variables="variables" :datos="filteredResources2" />
              <UiPaginador :total-paginas="1" @cambio="1" />
            </ClientOnly>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
