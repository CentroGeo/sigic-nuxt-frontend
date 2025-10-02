<script setup>
// TODO: Reactivar filtrado
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { cleanInput } from '~/utils/consulta';

const storeCatalogo = useCatalogoStore();
const storeResources = useResourcesCatalogoStore();
const storeConsulta = useConsultaStore();
const storeFilters = useFilteredResources();
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
const seleccionOrden = ref('');
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});

function updateResources() {
  //filteredResources.value = nuevosRecursos;
  // obteniendo datos por las props de la tabla
  tableResources.value = resources.value.map((d) => ({
    pk: d.pk,
    titulo: d.title,
    tipo_recurso: 'Datos tabulados',
    categoria: d.category,
    actualizacion: d.last_updated,
    acciones: 'Ver, Descargar',
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

watch(params, () => {
  paginaActual.value = 0;
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

/* const storeFetched = useFetchedResources2Store();
const storeFilters = useFilteredResources();
const storeConsulta = useConsultaStore();
storeConsulta.resourceType = resourceTypeDic.dataTable;
//storeFilters.resourceType = 'dataTable';
storeFetched.checkFilling(resourceTypeDic.dataTable);

const resourcesTablas = computed(() => storeFetched.byResourceType(resourceTypeDic.dataTable));
const filteredResources = ref([]);
const tableResources = ref([]);
const seleccionOrden = ref('');

const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});
const modalFiltroAvanzado = ref(null);
const isFilterActive = ref(false);

// obteniendo las variables keys para la tabla
const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];

function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  // obteniendo datos por las props de la tabla
  tableResources.value = filteredResources.value.map((d) => ({
    pk: d.pk,
    titulo: d.title,
    tipo_recurso: 'Datos tabulados',
    categoria: d.category,
    actualizacion: d.last_updated,
    acciones: 'Ver, Descargar',
    uuid: d.uuid,
    recurso_completo: d,
  }));
}

function applyAdvancedFilter() {
  isFilterActive.value = true;
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  updateResources(storeFilters.filter());
}

function resetAdvancedFilter() {
  isFilterActive.value = false;
  storeFilters.resetFilters();
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  updateResources(storeFilters.filter());
}

watch([resourcesTablas, inputSearch], () => {
  updateResources(storeFilters.filter());
});

watch(seleccionOrden, (nv) => {
  storeFilters.updateFilter('sort', nv);
  updateResources(storeFilters.filter());
});

onMounted(async () => {
  storeFilters.resetAll();
  if (resourcesTablas.value.length !== 0) {
    updateResources(resourcesTablas.value);
  }
}); */
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
                <option value="fecha_descendente">Recién agregados</option>
                <option value="titulo">Título</option>
                <option value="categoria">Categoría</option>
                <option value="fecha_ascendente">Más antiguo</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>

          <!-- Campo de búsqueda avanzada -->
          <div class="columna-8">
            <div class="flex flex-contenido-separado">
              <div class="columna-14">
                <ClientOnly>
                  <label for="idunicobusquedatablas"> Campo de búsqueda </label>
                  <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                    <input
                      id="idunicobusquedatablas"
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
          <h2>Datos tabulados</h2>
          <UiNumeroElementos :numero="totalResources" />
        </div>

        <div class="flex">
          <div class="columna-16">
            <ClientOnly>
              <UiTablaAccesibleV2 :variables="variables" :datos="tableResources" />
              <UiPaginador :total-paginas="totalPags" @cambio="paginaActual = $event" />
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
