<script setup>
// TODO: añadir selector a tipo de archivo a filtros y mejorar tabla
const resourcesFetched2 = useFetchedResources2Store();

resourcesFetched2.checkFilling('dataTable');
resourcesFetched2.checkFilling('document');

// // para filtar por los archivos de la usuaria
const { data } = useAuth();
const userEmail = data.value.user.email;

const datos = computed(() =>
  resourcesFetched2.all
    .filter((resource) => resource.owner.email === userEmail)
    .map((d) => ({
      pk: d.pk,
      titulo: d.title,
      tipo_recurso: d.resource_type,
      categoria: d.category,
      actualizacion: d.last_updated,
      acciones: 'Editar, Ver, Descargar, Remover',
      enlace_descarga: d.download_url,
    }))
);

const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="contenedor m-b-10 m-t-3">
        <!-- <CatalogoElementoFiltros
          :recursos-lista="recursosFiltrados"
          :recursos-tipo="recursosTipo"
        /> -->

        <div class="flex">
          <h2>Todos mis archivos</h2>
          <UiNumeroElementos :numero="datos.length" />
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
