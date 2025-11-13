<script setup>
// TODO: Reactivar filtrado
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { cleanInput, resourceTypeDic } from '~/utils/consulta';

const storeResources = useResourcesCatalogoStore();
const storeCatalogo = useCatalogoStore();
const storeConsulta = useConsultaStore();
const storeFilters = useFilteredResources();
storeConsulta.resourceType = resourceTypeDic.dataLayer;
const params = computed(() => storeFilters.filters.queryParams);
const totalResources = computed(() => storeResources.totalByType());
const paginaActual = ref(0);
const tamanioPagina = 10;
const totalPags = computed(() => Math.ceil(totalResources.value / tamanioPagina));
const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];
const resources = computed(() => storeResources.resourcesByType());
const tableResources = ref([]);
const modalFiltroAvanzado = ref(null);
const isFilterActive = ref(false);
const seleccionOrden = computed({
  get: () => storeFilters.filters.sort,
  set: (value) => storeFilters.updateFilter('sort', value),
});
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});

function setActions(resource) {
  if (resource.sourcetype === 'REMOTE') {
    return 'Ver';
  } else {
    return 'Ver, Descargar';
  }
}

function setTipoRecurso(resource) {
  if (resource.sourcetype === 'REMOTE') {
    return 'Capa Geográfica, Catálogo Externo';
  } else {
    return 'Capa Geográfica';
  }
}
function updateResources() {
  //filteredResources.value = nuevosRecursos;
  // obteniendo datos por las props de la tabla
  tableResources.value = resources.value.map((d) => ({
    pk: d.pk,
    titulo: d.title,
    tipo_recurso: setTipoRecurso(d),
    categoria: d.category,
    actualizacion: d.last_updated,
    acciones: setActions(d),
    uuid: d.uuid,
    recurso_completo: d,
  }));
}
function fetchNewData() {
  storeResources.resetByType();
  storeResources.getResourcesByPage(
    storeConsulta.resourceType,
    paginaActual.value + 1,
    tamanioPagina,
    params.value
  );
}
function applyAdvancedFilter() {
  isFilterActive.value = true;
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  storeFilters.buildQueryParams();
}

function resetAdvancedFilter() {
  isFilterActive.value = false;
  storeFilters.resetFilters();
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  storeFilters.buildQueryParams();
}

watch(paginaActual, () => {
  fetchNewData();
});
watch(seleccionOrden, () => {
  storeFilters.buildQueryParams();
});
watch(params, () => {
  paginaActual.value = 0;
  storeResources.getTotalResources(storeConsulta.resourceType, params.value);
  fetchNewData();
});
watch(
  resources,
  () => {
    updateResources();
  },
  { deep: true }
);

onMounted(async () => {
  storeFilters.resetAll();
  storeFilters.buildQueryParams();
  storeResources.getTotalResources(storeConsulta.resourceType, params.value);
  fetchNewData();
});
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-t-3">
        <div class="flex">
          <!-- Selector Orden -->
          <div class="columna-8">
            <ClientOnly>
              <SisdaiSelector v-model="seleccionOrden" etiqueta="Ordenar por">
                <option value="titulo">Título</option>
                <option value="categoria">Categoría</option>
                <option value="fecha_descendente">Más reciente</option>
                <option value="fecha_ascendente">Más antiguo</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>
          <!-- Campo de búsqueda avanzada -->
          <div class="columna-8">
            <div class="flex flex-contenido-separado">
              <div class="columna-14">
                <ClientOnly>
                  <label for="idunicobusqueda"> Campo de búsqueda </label>
                  <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                    <input
                      id="idunicobusqueda"
                      v-model="inputSearch"
                      type="search"
                      class="campo-busqueda-entrada"
                      placeholder="Campo de búsqueda"
                    />

                    <button
                      style="margin: 0; margin-right: 4px"
                      class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                      aria-label="Borrar"
                      type="button"
                      @click="storeFilters.updateFilter('inputSearch', '')"
                    >
                      <span aria-hidden="true" class="pictograma-cerrar" />
                    </button>

                    <button
                      class="boton-primario boton-pictograma campo-busqueda-buscar"
                      aria-label="Buscar"
                      type="button"
                    >
                      <span class="pictograma-buscar" aria-hidden="true" />
                    </button>
                  </form>
                </ClientOnly>
              </div>
              <div class="columna-2 flex-vertical-final">
                <button
                  :class="
                    isFilterActive
                      ? 'boton-primario boton-pictograma boton-grande'
                      : 'boton-secundario boton-pictograma boton-grande'
                  "
                  aria-label="Filtro Avanzado"
                  type="button"
                  @click="modalFiltroAvanzado.abrirModalBusqueda"
                >
                  <span class="pictograma-filtro" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex">
          <h2>Capas geográficas</h2>
          <UiNumeroElementos :numero="totalResources" />
        </div>

        <div class="flex">
          <div class="columna - 16">
            <ClientOnly>
              <UiTablaAccesibleV2 :variables="variables" :datos="tableResources" />
              <UiPaginador
                :pagina-parent="paginaActual"
                :total-paginas="totalPags"
                @cambio="paginaActual = $event"
              />
            </ClientOnly>
          </div>
        </div>
      </main>

      <!-- Modal Búsqueda avanzada -->
      <ConsultaModalBusqueda
        ref="modalFiltroAvanzado"
        @apply-filter="applyAdvancedFilter"
        @reset-filter="resetAdvancedFilter"
      />
    </template>
  </UiLayoutPaneles>
</template>
