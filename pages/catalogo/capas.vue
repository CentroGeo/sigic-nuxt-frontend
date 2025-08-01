<script setup>
// TODO: fix tabla, filtros y paginador
const resourcesStore = useSelectedResourcesStore();

const recursosTipo = ref('dataLayer');
const recursosFiltrados = ref([]);

// dataLayer
const recursosFiltradosCapas = ref([]);
const variables = ref([]);
const datos = ref([]);

const { resourcesList: listaRecursosCapas } = useGeonodeResources({
  resourceType: recursosTipo.value,
});

watch(listaRecursosCapas, () => {
  resourcesStore.updateFilteredResources(recursosTipo.value, listaRecursosCapas.value);
});

watch(
  () => resourcesStore.filteredResources[recursosTipo.value],
  () => {
    recursosFiltradosCapas.value = resourcesStore.filteredResources[recursosTipo.value];

    // obteniendo datos por las props que necesito
    datos.value = recursosFiltradosCapas.value.map((d) => ({
      nombre: d.title,
      // tipo_recurso: d.resource_type,
      tipo_recurso: 'Capa geográfica',
      categoria: d.category.gn_description,
      actualizacion: d.last_updated,
      acciones: 'Ver, Descargar',
      enlace_descarga: d.download_url,
    }));
    // obteniendo las variables de las keys
    variables.value = Object.keys(datos.value[0]);
  },
  { deep: true }
);
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <CatalogoElementoFiltros
          :recursos-lista="recursosFiltrados"
          :recursos-tipo="recursosTipo"
          :categorias="[
            'categoría_0: Todas',
            'categoría_1: capas',
            'categoría_2: tablas',
            'categoría_3: documentos',
          ]"
        />

        <div class="flex">
          <h2>Capas geográficas</h2>
          <UiNumeroElementos :numero="listaRecursosCapas.length" />
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
