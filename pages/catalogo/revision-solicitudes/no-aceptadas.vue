<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { cleanInput } from '~/utils/consulta';

definePageMeta({
  middleware: 'auth',
});

const storeCatalogo = useCatalogoStore();
const storeResources = useResourcesCatalogoStore();
const section = 'publicacion';
// const params = computed(() => storeFilters.filters.queryParams);
const isLoading = computed(() => storeResources.isLoading);
const totalResources = computed(() => storeResources.myTotalBySection(section));
const resources = computed(() => storeResources.mineBySection(section));
const tableResources = ref([]);
const variables = ['titulo', 'tipo_recurso', 'actualizacion', 'propietario', 'revisor', 'acciones'];

const paginaActual = ref(0);
const tamanioPagina = 10;
const totalPags = computed(() => Math.ceil(totalResources.value / tamanioPagina));

const seleccionTipoArchivo = ref('');
const storeFilters = useFilteredResources();

const seleccionOrden = computed({
  get: () => storeFilters.filters.sort,
  set: (value) => storeFilters.updateFilter('sort', value),
});
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});

function resetSearch() {
  storeFilters.updateFilter('inputSearch', '');
  storeFilters.buildQueryParams();
}

const isFilterActive = ref(false);
const modalFiltroAvanzado = ref(null);

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

/**
 * Obtiene las acciones dependiendo del estatus
 * @param status de la solicitud
 * @return {String} con las acciones
 */
const obtenerAcciones = (status) => {
  if (status === 'rejected') {
    return 'Visualizar, Comentarios';
  }
};

function updateResources() {
  // obteniendo datos por las props de la tabla
  tableResources.value = resources.value.map((d) => {
    return {
      pk: d.resource.pk,
      titulo: d.resource.title,
      // estatus: dictEstatus[d.status],
      tipo_recurso: tipoRecurso(d.resource),
      actualizacion: d.updated_at,
      propietario: d.owner.username,
      acciones: obtenerAcciones(d.status),
      comentarios: d.rejection_reason,
      revisor: d.reviewer?.username,
    };
  });
}

function fetchNewData() {
  storeResources.resetBySection(section);
  storeResources.getMyResourcesByPage(section, paginaActual.value + 1, tamanioPagina, {
    'filter{status}': 'rejected',
  });
}

watch(paginaActual, () => {
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
  storeResources.getMyTotal('publicacion', { 'filter{status}': 'rejected' });
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
                <option value="todes">Todos los archivos</option>
                <option value="capas">Capas geográficas</option>
                <option value="tablas">Datos tabulados</option>
                <option value="documentos">Documentos</option>
                <option value="remotas">Remotas</option>
              </SisdaiSelector>
            </ClientOnly>
          </div>
          <div class="columna-4">
            <ClientOnly>
              <SisdaiSelector v-model="seleccionOrden" etiqueta="Ordenar por">
                <option value="titulo">Título</option>
                <option value="categoria">Categoría</option>
                <option value="fecha_descendente">Más reciente</option>
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
                      @click="resetSearch"
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
            {
              texto: 'Pendientes de revisor',
              ruta: '/catalogo/revision-solicitudes/pendientes-revisor',
              notificacion: false,
            },
            {
              texto: 'Mis revisiones',
              ruta: '/catalogo/revision-solicitudes/mis-revisiones',
            },
            {
              texto: 'Aceptadas',
              ruta: '/catalogo/revision-solicitudes/aceptadas',
            },
            {
              texto: 'No aceptadas',
              ruta: '/catalogo/revision-solicitudes/no-aceptadas',
            },
          ]"
        />

        <div class="flex">
          <h2>No aceptadas</h2>
          <UiNumeroElementos :numero="totalResources" />
        </div>
        <p
          class="borde borde-color-alerta borde-redondeado-16 fondo-color-alerta texto-color-alerta p-3"
        >
          Las solicitudes No aceptadas se eliminarán automáticamente de esta lista después de 10
          días. No podrás consultarlas nuevamente.
        </p>
        <p>Solicitudes que no fueron aceptadas para su publicación en el catálogo público.</p>

        <div v-if="isLoading" class="flex flex-contenido-centrado m-t-3">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>

        <div v-if="totalResources > 0 && !isLoading" class="flex">
          <div class="columna-16">
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
        <div v-if="totalResources === 0 && !isLoading" class="flex flex-contenido-centrado">
          <div class="columna-8 flex flex-contenido-centrado">
            <div class="fondo-color-acento p-3">
              <p class="h5 m-t-0">Aún no hay archivos en esta sección</p>
              <p class="m-b-0">
                No tienes solicitudes No aceptadas. Estas se añadirán cuando No aceptes alguna
                solicitud de publicación que tengas en proceso de revisión.
              </p>
            </div>
            <nuxt-link
              class="boton boton-primario"
              to="/catalogo/revision-solicitudes/pendientes-revisor"
              >Ir a en proceso de revisión
            </nuxt-link>
          </div>
        </div>
      </main>

      <!-- Modal Búsqueda avanzada -->
      <ConsultaModalBusqueda
        ref="modalFiltroAvanzado"
        @apply-filter="console.log('applyAdvancedFilter')"
        @reset-filter="console.log('resetAdvancedFilter')"
      />
    </template>
  </UiLayoutPaneles>
</template>
