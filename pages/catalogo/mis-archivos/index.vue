<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { cleanInput } from '~/utils/consulta';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});
const storeResources = useResourcesCatalogoStore();
const storeFilters = useFilteredResources();
const storeCatalogo = useCatalogoStore();
const section = 'disponibles';
const params = computed(() => storeFilters.filters.queryParams);
const hayMetaPendiente = computed(() =>
  storeResources.myTotalBySection('pendientes') > 0 ? true : false
);
const haySolicitudesDeAprobacion = computed(() =>
  storeResources.myTotalBySection('publicacion') > 0 ? true : false
);
const totalResources = computed(() => storeResources.myTotalBySection(section));
const resources = computed(() => storeResources.mineBySection(section));
const tableResources = ref([]);
const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];
const paginaActual = ref(0);
const tamanioPagina = 10;
const totalPags = computed(() => Math.ceil(totalResources.value / tamanioPagina));

const modalFiltroAvanzado = ref(null);
const isFilterActive = ref(false);
const seleccionOrden = computed({
  get: () => storeFilters.filters.sort,
  set: (value) => storeFilters.updateFilter('sort', value),
});
const seleccionTipoArchivo = ref('');
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});

/**
 * Valida si el tipo de recurso es documento o dataset con geometría o no
 * @param recurso del catálogo
 * @returns {String} ya sea Documentos, Capa geográfica o Datos tabulados
 */
function tipoRecurso(recurso) {
  let tipo;
  if (recurso.resource_type === 'document') {
    tipo = 'Documentos';
  } else if (recurso.sourcetype === 'REMOTE') {
    tipo = 'Capa Geográfica, Catálogo Externo';
  } else {
    tipo = isGeometricExtension(recurso.extent) ? 'Capa Geográfica' : 'Datos Tabulados';
  }
  return tipo;
}

function setActions(recurso) {
  if (recurso.sourcetype === 'REMOTE' && recurso.is_published) {
    return 'Ver';
  } else if (recurso.sourcetype === 'REMOTE') {
    return 'Editar, Ver, Publicar, Remover';
  } else if (recurso.is_published === true) {
    return 'Ver, Descargar';
  } else {
    return 'Editar, Ver, Publicar, Descargar, Remover';
  }
}
function updateResources() {
  //filteredResources.value = nuevosRecursos;
  // obteniendo datos por las props de la tabla
  tableResources.value = resources.value.map((d) => ({
    pk: d.pk,
    titulo: d.title,
    tipo_recurso: tipoRecurso(d),
    categoria: d.category,
    actualizacion: d.last_updated,
    //acciones: 'Editar, Ver, Publicar, Descargar, Remover',
    acciones: setActions(d),
    uuid: d.uuid,
    resource_type: d.resource_type,
    extent: d.extent,
    recurso_completo: d,
  }));
}

function fetchNewData() {
  storeResources.resetBySection(section);
  storeResources.getMyResourcesByPage(section, paginaActual.value + 1, tamanioPagina, params.value);
}
function applyAdvancedFilter() {
  isFilterActive.value = true;
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  storeFilters.buildQueryParams(seleccionTipoArchivo.value);
}

function resetAdvancedFilter() {
  isFilterActive.value = false;
  storeFilters.resetFilters();
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  storeFilters.buildQueryParams(seleccionTipoArchivo.value);
}

watch([seleccionTipoArchivo, seleccionOrden], () => {
  storeFilters.buildQueryParams(seleccionTipoArchivo.value);
});

watch(paginaActual, () => {
  fetchNewData();
});

watch(params, () => {
  paginaActual.value = 0;
  storeResources.getMyTotal(section, params.value);
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
  storeFilters.buildQueryParams(seleccionTipoArchivo.value);
  storeResources.getMyTotal('disponibles', params.value);
  storeResources.getMyTotal('pendientes', params.value);
  storeResources.getMyTotal('publicacion', params.value);

  fetchNewData();
});
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="contenedor m-b-10 m-t-3">
        <!--Controles de filtros-->
        <div class="flex">
          <div class="columna-4">
            <ClientOnly>
              <SisdaiSelector v-model="seleccionTipoArchivo" etiqueta="Tipo de archivo">
                <option value="all">Todos los archivos</option>
                <option value="dataLayer">Capas geográficas</option>
                <option value="dataTable">Datos tabulados</option>
                <option value="document">Documentos</option>
                <option value="remotes">Remotas</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>
          <div class="columna-4">
            <ClientOnly>
              <SisdaiSelector v-model="seleccionOrden" etiqueta="Ordenar por">
                <option value="fecha_descendente">Recién agregados</option>
                <option value="titulo">Título</option>
                <option value="categoria">Categoría</option>
                <option value="fecha_ascendente">Más antiguo</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>
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

        <CatalogoMenuMisArchivos
          :opciones="[
            { texto: 'Disponibles', ruta: '/catalogo/mis-archivos' },
            {
              texto: 'Metadatos pendientes',
              ruta: '/catalogo/mis-archivos/metadatos-pendientes',
              notificacion: hayMetaPendiente,
            },
            {
              texto: 'Solicitudes de publicación',
              ruta: '/catalogo/mis-archivos/solicitudes-publicacion',
              notificacion: haySolicitudesDeAprobacion,
            },
          ]"
        />

        <div class="flex">
          <p
            class="texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-2 p-2 m-0"
          >
            Si no encuentras tus archivos aquí, es porque aún tienen <i>Metadatos pendientes</i>. Ve
            a la pestaña Pendientes y complétalos para que se muestren en esta sección.
          </p>
          <h2>Todos mis archivos disponibles</h2>
          <UiNumeroElementos :numero="totalResources" />
        </div>
        <p>En esta tabla se muestran los archivos disponibles para su consulta y uso.</p>
        <div class="flex">
          <div class="columna-16">
            <!-- TODO: implementar paginador -->
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
