<script setup>
// TODO: añadir selector a tipo de archivo a filtros y mejorar tabla
const resourcesStore = useSelectedResourcesStore();
const recursosFiltrados = ref([]);
const recursosTipo = ref('todos');

// todos
const { resourcesList } = useGeonodeResources({
  resourceType: recursosTipo.value,
});

// para la tabla
const variables = ref([]);
const datos = ref([]);
// para filtar por los archivos de la usuaria
const { data } = useAuth();
const userEmail = ref(data.value.user.email);

watch(resourcesList, () => {
  resourcesStore.updateFilteredResources(recursosTipo.value, resourcesList.value);

  // filtrar y seleccionar metadatos
  datos.value = resourcesList.value
    .filter((resource) => resource.owner.email === userEmail.value)
    .map((d) => ({
      pk: d.pk,
      titulo: d.title,
      tipo_recurso: d.resource_type,
      categoria: d.category,
      actualizacion: d.last_updated,
      acciones: 'Editar, Ver, Descargar, Remover',
      enlace_descarga: d.download_url,
    }));

  // obteniendo las keys
  variables.value = Object.keys(datos.value[0]);
});
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
        />

        <h2>Todos mis archivos</h2>
        <div class="flex">
          <div class="columna-15">
            <!-- {{ datos }} -->
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
