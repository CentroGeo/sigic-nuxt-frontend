<script setup>
// TODO: fix filtros avanzados y paginador
// import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import { cleanInput, resourceTypeDic } from '~/utils/consulta';

const storeFetched = useFetchedResources2Store();
const storeFilters = useFilteredResources();

storeFetched.checkFilling(resourceTypeDic.dataLayer);
storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

const recursos = computed(() => storeFetched.all);
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

// para filtar por los archivos de la usuaria
const { data } = useAuth();
const userEmail = data.value.user.email;

/**
 * Valida si el tipo de recurso es documento o dataset con geometría o no
 * @param recurso del catálogo
 * @returns {String} ya sea Documentos, Capa geográfica o Datos tabulados
 */
function tipoRecurso(recurso) {
  if (recurso.resource_type === 'document') {
    return 'Documentos';
  } else {
    return isGeometricExtension(recurso.extent) ? 'Capa geográfica' : 'Datos tabulados';
  }
}

function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  // obteniendo datos por las props de la tabla
  tableResources.value = filteredResources.value
    .filter((resource) => resource.owner.email === userEmail)
    .map((d) => ({
      pk: d.pk,
      titulo: d.title,
      tipo_recurso: tipoRecurso(d),
      categoria: d.category,
      actualizacion: d.last_updated,
      acciones: 'Editar, Ver, Descargar, Remover',
      uuid: d.uuid,
      resource_type: d.resource_type,
      recurso_completo: d,
    }));
}

function applyAdvancedFilter() {
  isFilterActive.value = true;
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  updateResources(storeFilters.filter('all'));
}

function resetAdvancedFilter() {
  isFilterActive.value = false;
  storeFilters.resetFilters();
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  updateResources(storeFilters.filter('all'));
}

watch([recursos, inputSearch], () => {
  updateResources(storeFilters.filter('all'));
});

watch(seleccionOrden, (nv) => {
  storeFilters.updateFilter('sort', nv);
  updateResources(storeFilters.filter('all'));
});

onMounted(async () => {
  storeFilters.resetAll();
  if (recursos.value.length !== 0) {
    updateResources(recursos.value);
  }
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="contenedor m-b-10 m-t-3">
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
                  <label for="idunicobusquedamisarchivos"> Campo de búsqueda </label>
                  <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                    <input
                      id="idunicobusquedamisarchivos"
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

        <!-- TODO: nivel anidado de nuxt-link -->
        <div class="flex">
          <h2>Todos mis archivos disponibles</h2>
          <UiNumeroElementos :numero="tableResources.length" />
        </div>
        <p>En esta tabla se muestran los archivos disponibles para su consulta y uso.</p>
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
