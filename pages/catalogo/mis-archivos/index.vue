<script setup>
// TODO: añadir selector a tipo de archivo a filtros y mejorar tabla
const resourcesStore = useSelectedResourcesStore();

const recursosFiltrados = ref([]);
const recursosTipo = ref('todos');

const variables = ref([]);
const datos = ref([]);

// todos
const { resourcesList } = useGeonodeResources({
  resourceType: recursosTipo.value,
});
watch(resourcesList, () => {
  resourcesStore.updateFilteredResources(recursosTipo.value, resourcesList.value);
});
watch(
  () => resourcesStore.filteredResources[recursosTipo.value],
  () => {
    recursosFiltrados.value = resourcesStore.filteredResources[recursosTipo.value];
    // obteniendo datos por las props que necesito
    datos.value = recursosFiltrados.value.map((d) => ({
      titulo: d.title,
      tipo_recurso: d.resource_type,
      // tipo_recurso: "Capa geográfica",
      categoria: d.category.gn_description,
      actualizacion: d.last_updated,
      acciones: 'Editar, Descargar, Remover',
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
      <main class="contenedor m-b-10 m-t-3">
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
        <h2>Todos mis archivos</h2>
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
