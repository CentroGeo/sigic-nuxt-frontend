<script setup>
// TODO: fix paginador
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import { cleanInput, resourceTypeDic } from '~/utils/consulta';

const storeFetched = useFetchedResources2Store();
const storeFilters = useFilteredResources();

storeFilters.resourceType = 'document';

storeFetched.checkFilling(resourceTypeDic.document);

const resourcesTablas = computed(() => storeFetched.byResourceType(resourceTypeDic.document));
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
    tipo_recurso: 'Documentos',
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
});
</script>

<template>
  <UiLayoutPaneles>
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
                  <label for="idunicobusquedadocumentos"> Campo de búsqueda </label>
                  <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                    <input
                      id="idunicobusquedadocumentos"
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
          <h2>Documentos</h2>
          <UiNumeroElementos :numero="tableResources.length" />
        </div>

        <div class="flex">
          <div class="columna-16">
            <!-- TODO: implementar paginador -->
            <ClientOnly>
              <UiTablaAccesibleV2 :variables="variables" :datos="tableResources" />
              <UiPaginador :total-paginas="1" @cambio="1" />
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
