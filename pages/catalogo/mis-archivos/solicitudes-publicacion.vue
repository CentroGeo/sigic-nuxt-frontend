<script setup>
/**TODO: agregar método para traer la info del usuario al store */
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { buildUrl, cleanInput } from '~/utils/consulta';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const { data } = useAuth();
const storeResources = useResourcesCatalogoStore();
const storeFilters = useFilteredResources();
const storeCatalogo = useCatalogoStore();

const section = 'publicacion';
const isLoading = computed(() => storeResources.isLoading);
const params = computed(() => storeFilters.filters.queryParams);
const totalResources = computed(() => storeResources.myTotalBySection(section));
const resources = computed(() => storeResources.mineBySection(section));
const tableResources = ref([]);
const variables = ['titulo', 'estatus', 'tipo_recurso', 'categoria', 'acciones'];

const paginaActual = ref(0);
const tamanioPagina = 10;
const totalPags = computed(() => Math.ceil(totalResources.value / tamanioPagina));

const modalFiltroAvanzado = ref(null);
const isFilterActive = ref(false);
const seleccionTipoArchivo = computed({
  get: () => storeFilters.filters.requests,
  set: (value) => storeFilters.updateFilter('requests', value),
});
const seleccionOrden = computed({
  get: () => storeFilters.filters.sort,
  set: (value) => storeFilters.updateFilter('sort', value),
});

const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});

const hayMetaPendiente = computed(() =>
  storeResources.myTotalBySection('pendientes') > 0 ? true : false
);

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

const dictEstatus = {
  pending: 'Pendiente',
  published: 'Publicado',
  rejected: 'No aceptado',
  on_review: 'En revisión',
};

/**
 * Formatea la fecha del recurso a esta forma: dd/mm/aaaa
 * @param fecha de actualización del recurso
 * @returns {Date} objeto con la fecha
 */
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function updateResources() {
  // obteniendo datos por las props de la tabla
  tableResources.value = resources.value.map((d) => {
    return {
      titulo: d.resource.title,
      tipo_recurso: tipoRecurso(d.resource),
      categoria: d.resource.category,
      actualizacion: formatearFecha(d.updated_at),
      estatus: dictEstatus[d.status],
      acciones: 'Ver, Comentarios, Remover',
      comentarios: d.rejection_reason,
      revisor: d.reviewer?.username,
    };
  });
}

const userReviewerPk = ref(null);
function fetchNewData() {
  storeResources.resetBySection(section);
  params.value['filter{owner}'] = `${userReviewerPk.value}`;
  storeResources.getMyResourcesByPage(section, paginaActual.value + 1, tamanioPagina, params.value);
}

watch([seleccionTipoArchivo], () => {
  storeFilters.buildQueryParams();
});

watch(paginaActual, () => {
  fetchNewData();
});

watch(params, () => {
  paginaActual.value = 0;
  params.value['filter{owner}'] = `${userReviewerPk.value}`;
  storeResources.getMyTotal('publicacion', params.value);
  fetchNewData();
});

watch(
  resources,
  () => {
    updateResources();
  },
  { deep: true }
);

try {
  const configEnv = useRuntimeConfig();
  const { gnoxyFetch } = useGnoxyUrl();
  const userEmail = data.value?.user.email;
  const baseUrl = configEnv.public.geonodeApi;
  const queryParams = {
    page_size: 1,
    'filter{email}': userEmail,
  };

  // petición para traer solo el usuario que coincida con el parámetro email
  const url = buildUrl(`${baseUrl}/users`, queryParams);
  const request = await gnoxyFetch(url.toString());
  const res = await request.json();
  const userInfo = res.users;

  userReviewerPk.value = userInfo[0].pk;
} catch (error) {
  console.error(error);
}

onMounted(async () => {
  storeFilters.resetAll();
  storeFilters.buildQueryParams();
  storeResources.getMyTotal('disponibles', {});
  storeResources.getMyTotal('pendientes', {});

  params.value['filter{owner}'] = `${userReviewerPk.value}`;
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
              <SisdaiSelector v-model="seleccionTipoArchivo" etiqueta="Estatus">
                <option value="all">Todos los estatus</option>
                <option value="on_review">En revisión</option>
                <option value="published">Aceptados</option>
                <option value="pending">Pendientes</option>
                <option value="rejected">No Aceptados</option>
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
            { texto: 'Disponibles', ruta: '/catalogo/mis-archivos' },
            {
              texto: 'Metadatos pendientes',
              ruta: '/catalogo/mis-archivos/metadatos-pendientes',
              notificacion: hayMetaPendiente,
            },
            {
              texto: 'Solicitudes de publicación',
              ruta: '/catalogo/mis-archivos/solicitudes-publicacion',
              notificacion: totalResources > 0,
            },
            {
              texto: 'Gestión de solicitudes',
              ruta: '/catalogo/revision-solicitudes',
              notificacion: false,
            },
          ]"
        />

        <div class="flex">
          <p
            class="texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-2 p-2 m-0"
          >
            Si el estatus de tu publicación aparece como <i>No aceptada</i>, revisa tu correo
            electrónico donde encontrarás los motivos del rechazo y las indicaciones para realizar
            las correciones necesarias.
          </p>
          <h2>Solicitudes de publicación</h2>
          <UiNumeroElementos :numero="totalResources" />
        </div>
        <p>
          E esta tabla se muestran los archivos enviados para revisión antes de publicarse en el
          catálogo público de SIGIC. También puedes consultar el estatus de su aprobación.
        </p>

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

        <div v-if="totalResources === 0 && !isLoading">
          <div class="flex flex-contenido-centrado">
            <div class="columna-7">
              <div class="fondo-color-acento borde-redondeado-8 p-x-3 p-y-1 m-b-3">
                <p>Aún no hay archivos en esta sección.</p>
                <p>
                  No tienes solicitudes de publicación activas. Para iniciar, dirígete a Mis
                  archivos > Disponibles y selecciona uno para enviar a publicación.
                </p>
              </div>
              <div class="flex flex-contenido-centrado">
                <NuxtLink class="boton boton-primario" to="/catalogo/mis-archivos"
                  >Disponibles
                </NuxtLink>
              </div>
            </div>
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
