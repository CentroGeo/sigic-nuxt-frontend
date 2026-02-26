<script setup>
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
const section = 'pendientes';
const params = computed(() => storeFilters.filters.queryParams);
const hayMetaPendiente = computed(() =>
  storeResources.myTotalBySection('pendientes') > 0 ? true : false
);
const haySolicitudesDeAprobacion = computed(() =>
  storeResources.myTotalBySection('publicacion') > 0 ? true : false
);
const isLoading = ref(true);
const totalResources = computed(() => storeResources.myTotalBySection(section));
const resources = computed(() => storeResources.mineBySection(section));
const tableResources = ref([]);
const variables = ['pk', 'titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'acciones'];
const paginaActual = ref(0);
const tamanioPagina = 10;
const totalPags = computed(() => Math.ceil(totalResources.value / tamanioPagina));
const seleccionOrden = computed({
  get: () => storeFilters.filters.sort,
  set: (value) => storeFilters.updateFilter('sort', value),
});
const seleccionTipoArchivo = ref('all');
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});
const appliedFilters = ref(false);

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

/**Crea el objeto de información como se necesita para esta vista */
function updateResources() {
  tableResources.value = resources.value.map((d) => ({
    pk: d.pk,
    titulo: d.title,
    tipo_recurso: tipoRecurso(d),
    categoria: d.category,
    actualizacion: d.last_updated,
    acciones: 'Editar, Remover',
    uuid: d.uuid,
    resource_type: d.resource_type,
    extent: d.extent,
    recurso_completo: d,
  }));
}

async function fetchNewData() {
  isLoading.value = true;
  storeResources.resetBySection(section);
  await storeResources.getMyResourcesByPage(
    section,
    paginaActual.value + 1,
    tamanioPagina,
    params.value
  );
  isLoading.value = false;
}

function resetSearch() {
  storeFilters.updateFilter('inputSearch', '');
  storeFilters.buildQueryParams(seleccionTipoArchivo.value);
}

function updateAppliedFilters() {
  if (
    Object.keys(params.value).includes('filter{resource_type.in}') ||
    Object.keys(params.value).includes('filter{subtype.in}') ||
    Object.keys(params.value).includes('search')
  ) {
    appliedFilters.value = true;
  } else {
    appliedFilters.value = false;
  }
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
  updateAppliedFilters();
});

watch(
  resources,
  () => {
    updateResources();
  },
  { deep: true }
);

onMounted(async () => {
  appliedFilters.value = false;
  await storeCatalogo.getUserInfo();
  storeFilters.resetAll();
  storeFilters.buildQueryParams(seleccionTipoArchivo.value);
  storeResources.getMyTotal('disponibles', params.value);
  storeResources.getMyTotal('publicacion', {
    ...params.value,
    'filter{owner}': storeCatalogo.userInfo.pk,
  });
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
          <div class="columna-5">
            <ClientOnly>
              <label for="selector-tipo-meta-pendientes">Tipo de archivo</label>
              <select
                v-model="seleccionTipoArchivo"
                name="selector-tipo-meta-pendientes"
                class="m-b-2"
                :disabled="isLoading"
              >
                <option value="all">Todos los Archivos</option>
                <option value="remotes">Catálogos Externos</option>
                <option value="dataLayer">Capas Geográficas</option>
                <option value="dataTable">Datos Tabulados</option>
                <option value="document">Documentos</option>
              </select>
            </ClientOnly>
          </div>
          <div class="columna-5">
            <ClientOnly>
              <label for="selector-ordenar-completos">Ordenar por</label>
              <select v-model="seleccionOrden" class="m-b-2" :disabled="isLoading">
                <option value="titulo">Título</option>
                <option value="fecha_descendente">Más Reciente</option>
                <option value="fecha_ascendente">Más Antiguo</option>
              </select>
            </ClientOnly>
          </div>
          <div class="columna-6">
            <div class="flex flex-contenido-separado">
              <div class="columna-16">
                <ClientOnly>
                  <label for="idunicobusquedamisarchivos"> Campo de búsqueda </label>
                  <form class="campo-busqueda" style="height: 40px" @submit.prevent>
                    <input
                      id="idunicobusquedamisarchivos"
                      v-model="inputSearch"
                      type="search"
                      class="campo-busqueda-entrada"
                      placeholder="Campo de búsqueda"
                      :disabled="isLoading"
                      @keyup.enter="storeFilters.buildQueryParams(seleccionTipoArchivo)"
                    />

                    <button
                      style="margin: 0; margin-right: 4px"
                      class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                      aria-label="Borrar"
                      type="button"
                      :disabled="isLoading"
                      @click="resetSearch"
                    >
                      <span aria-hidden="true" class="pictograma-cerrar" />
                    </button>

                    <button
                      class="boton-primario boton-pictograma campo-busqueda-buscar"
                      aria-label="Buscar"
                      type="button"
                      :disabled="isLoading"
                      @click="storeFilters.buildQueryParams(seleccionTipoArchivo)"
                    >
                      <span class="pictograma-buscar" aria-hidden="true" />
                    </button>
                  </form>
                </ClientOnly>
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
          <h2>Todos los archivos pendientes</h2>
          <UiNumeroElementos :numero="totalResources" />
        </div>

        <!--Si está cargando-->
        <div v-if="isLoading" class="flex flex-contenido-centrado m-t-3 columna-16">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>

        <!--Cuando no se encontraron resultados que coincidan con la búsqueda-->
        <div v-if="totalResources === 0 && !isLoading && appliedFilters" class="flex">
          <div
            class="flex flex-contenido-centrado columna-16 borde-redondeado-16 m-2 fondo-color-informacion texto-color-informacion p-2"
          >
            <p class="nota texto-color-informacion m-2">
              No se encontraron resultados que coincidan con la búsqueda.
            </p>
          </div>
        </div>

        <!--Cuando no se hay archivos en la sección-->
        <div v-if="totalResources === 0 && !isLoading && !appliedFilters">
          <div class="flex flex-contenido-centrado">
            <div class="columna-7">
              <div class="fondo-color-acento borde-redondeado-8 p-x-3 p-y-1 m-b-3">
                <p>Aún no hay archivos en esta sección.</p>
                <p>No has cargado archivos. Para iniciar, dirígete a Carga de archivos.</p>
              </div>
              <div class="flex flex-contenido-centrado">
                <NuxtLink class="boton boton-primario" to="/catalogo/cargar-archivos"
                  >Carga de archivos
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!--Cuando si hay archivos-->
        <p v-if="totalResources !== 0 && !isLoading">
          Aquí se listan los archivos pendientes de metadatos. Complétalos para poder usuarlos; al
          hacerlo se moverán a la sección de disponibles.
        </p>
        <div v-if="totalResources !== 0 && !isLoading" class="flex">
          <div v-if="!isLoading" class="columna-16">
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
    </template>
  </UiLayoutPaneles>
</template>
