<script setup>
// TODO: fix paginador
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { cleanInput, resourceTypeDic } from '~/utils/consulta';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

// para filtar por los archivos de la usuaria
const { data } = useAuth();
const userEmail = data.value.user.email;

const storeCatalogo = useCatalogoStore();
const storeFetched = useFetchedResources2Store();
const storeFilters = useFilteredResources();

storeFetched.checkFilling(resourceTypeDic.dataLayer);
storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

const recursos = computed(() => storeFetched.all);
const filteredResources = ref([]);
const tableResources = ref([]);
const tableResources2 = ref([
  {
    titulo: 'Capas lago texcoco',
    tipo_recurso: 'Capa geográfica',
    categoria: { gn_description: 'Environment' },
    actualizacion: '22 sep 2025',
    estatus: 'Pendiente',
  },
  {
    titulo: 'Flora_fauna_texcoco',
    tipo_recurso: 'Datos tabulados',
    categoria: { gn_description: 'Environment' },
    actualizacion: '22 sep 2025',
    estatus: 'En revisión',
  },
  {
    titulo: 'Pueblos originarios Texcoco',
    tipo_recurso: 'Documentos',
    categoria: { gn_description: 'Environment' },
    actualizacion: '22 sep 2025',
    estatus: 'Publicado',
  },
  {
    titulo: 'Agua balance hídrico',
    tipo_recurso: 'Capa geográfica',
    categoria: { gn_description: 'Environment' },
    actualizacion: '22 sep 2025',
    estatus: 'No aceptado',
  },
]);
const seleccionOrden = ref('');
const seleccionTipoArchivo = ref('');

const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});
const modalFiltroAvanzado = ref(null);
const isFilterActive = ref(false);

// obteniendo las variables keys para la tabla
const variables = ['titulo', 'tipo_recurso', 'categoria', 'actualizacion', 'estatus'];

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
  // TODO: enviar solo los recursos que son candidatos a publicarse
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
watch(seleccionTipoArchivo, (nv) => {
  storeFilters.filters.resourceType = nv;
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
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main class="contenedor m-b-10 m-t-3">
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
              notificacion: true,
            },
            {
              texto: 'Solicitudes de publicación',
              ruta: '/catalogo/mis-archivos/solicitudes-publicacion',
              notificacion: true,
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
          <UiNumeroElementos :numero="tableResources2.length" />
        </div>
        <p>
          En esta tabla se muestran los archivos enviados para revisión antes de publicarse en el
          catálogo público de SIGIC. También puedes consultar el estatus de su aprobación.
        </p>

        <div v-if="tableResources2.length === 0">
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

        <div v-else class="flex">
          <div class="columna-16">
            <!-- TODO: implementar paginador -->
            <ClientOnly>
              <UiTablaAccesibleV2 :variables="variables" :datos="tableResources2" />
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
