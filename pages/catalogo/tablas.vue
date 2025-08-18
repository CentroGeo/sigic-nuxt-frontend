<script setup>
// TODO: fix tabla, filtros y paginador
import { resourceTypeDic } from '~/utils/consulta';
const storeFetched = useFetchedResources2Store();

storeFetched.checkFilling(resourceTypeDic.dataTable);
const resourcesTablas = computed(() => storeFetched.byResourceType(resourceTypeDic.dataTable));

// obteniendo datos por las props de la tabla
const datos = computed(() =>
  resourcesTablas.value.map((d) => ({
    pk: d.pk,
    titulo: d.title,
    // tipo_recurso: d.resource_type,
    tipo_recurso: 'Datos tabulados',
    categoria: d.category,
    actualizacion: d.last_updated,
    acciones: 'Ver, Descargar',
    enlace_descarga: d.download_url,
  }))
);
// obteniendo las variables keys para la tabla
const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];
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
          <h2>Tablas</h2>
          <UiNumeroElementos :numero="resourcesTablas.length" />
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
