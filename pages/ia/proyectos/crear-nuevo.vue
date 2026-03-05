<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiGrupoBotonesRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

import { buildUrl, categoriesInSpanish, categoriesValues, cleanInput } from '~/utils/consulta';

const config = useRuntimeConfig();
const router = useRouter();
const storeIA = useIAStore();
const storeFilters = useFilteredResources();
const storeResources = useResourcesIAStore();
const { gnoxyFetch } = useGnoxyUrl();

const catalogo = ref([]);
const catalogoFiltrado = ref(catalogo.value);

const resourceType = ref('dataTable');
const recursos = computed(() => storeResources.resources[resourceType.value]);
const recursosSeleccionados = computed(() => storeResources.selectedResources[resourceType.value]);
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});
const mensajeAyudaBuscador = ref('');
const campoBusqueda = ref('');

const agregaCatalogoModal = ref(null);
const seleccionCatalogoModal = ref(null);
const dictTipoRecurso = {
  dataLayer: 'capas',
  dataTable: 'tablas',
  document: 'documentos',
};
const dictCategoria = {
  datasets: 'Datos tabulados',
  documents: 'Documentos',
};

// Datos para selección
const archivosSeleccionados = ref([]);
const categoriaSeleccionada = ref(null);
const archivosEliminados = ref([]);
const archivosGeonode = ref([]);
const archivosTabla = ref([]);

// Datos para modal para agregar fuentes del catálogo
const totalResources = ref(0);
const params = computed(() => storeFilters.filters.queryParams);
const apiCategorias = `${config.public.geonodeApi}/facets/category?page_size=30`;
const categoriesDict = ref({});
const totalCategoria = ref(0);
const nthElement = 1;

const recursosCargando = ref(false);

// Datos del formulario
const nombreProyecto = ref('');
const descripcionProyecto = ref('');
const visibilidadProyecto = ref('publico'); // Valor por defecto

const loaderModal = ref(null);
const loaderTitle = ref('');
const loaderMsg = ref('');

// Método para obtener el total de categorías de recursos con metadatos completos y publicados
async function fetchTotalByCategory(category) {
  const preParams = params.value;
  preParams['filter{category.identifier.in}'] = category;
  preParams['filter{complete_metadata}'] = 'true';
  preParams['filter{is_published}'] = 'true';
  const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, preParams);
  const request = await gnoxyFetch(url.toString());
  const res = await request.json();
  return res.total;
}

// Método para construir el diccionario de categorías para el modal
async function buildCategoriesDict() {
  categoriesDict.value = {};
  // Esta parte es para obtener todas las categorias
  const request = await gnoxyFetch(apiCategorias);
  const geonodeCategories = await request.json();
  const results = await Promise.all(
    geonodeCategories.topics.items.map(async (d) => {
      const totalByCat = await fetchTotalByCategory(d.key);
      if (totalByCat !== 0) {
        categoriesDict.value[d.label] = {
          label: d.label,
          name: d.key,
          inSpanish: categoriesInSpanish[d.label],
          total: totalByCat,
          page: 1,
          isLoading: false,
        };
      }
      return totalByCat;
    })
  );
  totalResources.value = results.reduce((a, b) => a + b, 0);
}

async function callResources(categoria) {
  const total = categoriesDict.value[categoria]?.total;
  const count = recursos.value.length;
  if (total > count) {
    const preParams = params.value;
    categoriesDict.value[categoria].page += 1;
    await storeResources.fetchByCategory(
      resourceType.value,
      categoriesDict.value[categoria].page,
      preParams
    );
  }
}

async function fetchNewData() {
  if (totalCategoria.value > recursos.value.length) {
    categoriesDict.value[categoriaSeleccionada.value].isLoading = true;
    await callResources(categoriaSeleccionada.value);
    storeResources.setNthElements(resourceType.value, [
      recursos.value[recursos.value.length - nthElement]?.pk,
    ]);
    categoriesDict.value[categoriaSeleccionada.value].isLoading = false;
  }
}

// Selecciona la categoría en el modal de fuentes de catálogo
async function seleccionarCategoria(categoria) {
  if (categoriaSeleccionada.value !== categoriesDict.value[categoria].label) {
    // reseteando recursos filtrados por categoría y valores
    recursosCargando.value = true;
    storeFilters.updateFilter('inputSearch', '');
    totalCategoria.value = 0;
    storeResources.resetByType(resourceType.value);
    categoriesDict.value[categoria].page = 1;
    categoriaSeleccionada.value = categoriesDict.value[categoria].label;
    // actualizando filtro por categoría
    storeFilters.updateFilter('categories', [categoriesDict.value[categoria].name]);
    // construyendo parámetros para la petición
    storeFilters.buildQueryParams(resourceType.value);
    totalCategoria.value = categoriesDict.value[categoriaSeleccionada.value].total;

    // fetch de recursos paginados totales
    await storeResources.fetchByCategory(resourceType.value, 1, params.value);
    storeResources.setNthElements(resourceType.value, [
      recursos.value[recursos.value.length - nthElement]?.pk,
    ]);
    recursosCargando.value = false;
  }
}

// Método para remover la búsqueda en el filtro de proyectos
function removerBusquedaFiltro() {
  campoBusqueda.value = '';
  catalogoFiltrado.value = catalogo.value;
}

// Método para buscar el recurso con filtro el modal de fuentes de catálogo
async function buscarRecurso() {
  if (categoriaSeleccionada.value !== null) {
    // reseteando recursos filtrados por categoría y valores
    recursosCargando.value = true;
    mensajeAyudaBuscador.value = '';
    totalCategoria.value = 0;
    storeResources.resetByType(resourceType.value);
    categoriesDict.value[categoriaSeleccionada.value].page = 1;
    // contruyendo parámetros
    storeFilters.buildQueryParams(resourceType.value);
    totalCategoria.value = await fetchTotalByCategory(
      categoriesValues[categoriaSeleccionada.value]
    );
    // fetch de recursos paginados filtrados
    await storeResources.fetchByCategory(resourceType.value, 1, params.value);
    storeResources.setNthElements(resourceType.value, [
      recursos.value[recursos.value.length - nthElement].pk,
    ]);
    recursosCargando.value = false;
  } else {
    mensajeAyudaBuscador.value = 'Falta seleccionar categoría.';
  }
}

// Remueve la búsqueda en el filtro del modal de fuentes de catálogo
async function removerBusqueda() {
  storeFilters.updateFilter('inputSearch', '');
  if (categoriaSeleccionada.value !== null && inputSearch.value === '') {
    recursosCargando.value = true;
    totalCategoria.value = 0;
    storeResources.resetByType(resourceType.value);
    categoriesDict.value[categoriaSeleccionada.value].page = 1;
    // contruyendo parámetros
    storeFilters.buildQueryParams(resourceType.value);
    totalCategoria.value = categoriesDict.value[categoriaSeleccionada.value].total;
    // fetch de recursos paginados totales
    await storeResources.fetchByCategory(resourceType.value, 1, params.value);
    storeResources.setNthElements(resourceType.value, [
      recursos.value[recursos.value.length - nthElement].pk,
    ]);
    recursosCargando.value = false;
  }
}

// Abre el modal para elegir el tipo de fuente del catálogo
function agregarFuentesCatalogo() {
  // limpiando recursos filtrados por categoría y seleccionados
  storeFilters.updateFilter('inputSearch', '');
  categoriaSeleccionada.value = null;
  totalCategoria.value = 0;
  storeResources.resetByType(resourceType.value);
  storeResources.resetSelectedByType(resourceType.value);
  agregaCatalogoModal.value?.abrirModal();
}

// Abre el modal para agregar fuentes del catálogo
async function siguenteAgregar() {
  agregaCatalogoModal.value.cerrarModal();
  seleccionCatalogoModal.value.abrirModal();
  totalCategoria.value = 0;
  storeResources.resetByType(resourceType.value);
  storeResources.resetSelectedByType(resourceType.value);
  storeFilters.buildQueryParams(resourceType.value);
  await buildCategoriesDict();
}

// Función para consultar lista de proyectos
const loadProjectList = async () => {
  let arrayProjects = [];

  // Consulta proyectos
  arrayProjects = await storeIA.getProjectsList();

  catalogo.value = arrayProjects;
  catalogoFiltrado.value = arrayProjects;
};

// Función para seleccionar proyecto y navegar
function seleccionarProyecto(proyecto) {
  storeIA.seleccionarProyecto(proyecto);

  const idSeleccionado = proyecto.id.toString();
  // Navega a ruta
  router.push(`/ia/proyecto/${idSeleccionado}`);
}

// Método para manejar los archivos seleccionados del catálogo de geonode
function cargarArchivosGeonode() {
  seleccionCatalogoModal?.value.cerrarModal();
  // se obtiene primero del geonode
  const nuevosArchivos = recursosSeleccionados.value.map((file) => ({
    id: Math.floor(Math.random() * 1000000000000000000000),
    nombre: file.title,
    tipo: file.resource_type === 'dataset' ? 'CSV' : obtenerTipoArchivo(file.title),
    archivo: null,
    origen: 'Catálogo',
    pk: file.pk,
    category: file.resource_type + 's',
  }));

  archivosGeonode.value = [...archivosGeonode.value, ...nuevosArchivos];
  archivosTabla.value = [...archivosSeleccionados.value, ...archivosGeonode.value];
}

// Método para manejar la selección de archivos
const manejarSeleccionArchivos = (event) => {
  const nuevosArchivos = Array.from(event.target.files).map((file) => ({
    // id: Date.now() + Math.random().toString(36).substr(2, 9),
    id: Math.floor(Math.random() * 1000000000000000000000),
    nombre: file.name,
    tipo: obtenerTipoArchivo(file.name),
    archivo: file, // Objeto File original
    category: 'documents',
    origen: 'Propio',
  }));

  archivosSeleccionados.value = [...archivosSeleccionados.value, ...nuevosArchivos];
  archivosTabla.value = [...archivosSeleccionados.value, ...archivosGeonode.value];

  event.target.value = ''; // Resetear el input para permitir seleccionar el mismo archivo otra vez
};

// Función para determinar el tipo de archivo
const obtenerTipoArchivo = (nombre) => {
  const extension = nombre.split('.').pop().toLowerCase();
  const tipos = {
    shp: 'Shapefile',
    geojson: 'GeoJSON',
    csv: 'CSV',
    kml: 'KML',
    zip: 'ZIP',
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
  };
  return tipos[extension] || extension.toUpperCase();
};

// Método para eliminar archivo de la lista
const eliminarArchivo = (id) => {
  archivosSeleccionados.value = archivosSeleccionados.value.filter((archivo) => archivo.id !== id);
  archivosGeonode.value = archivosGeonode.value.filter((archivo) => archivo.id !== id);
  archivosTabla.value = archivosTabla.value.filter((archivo) => archivo.id !== id);

  archivosEliminados.value.push(id);
};

// Función para guardar el proyecto
const guardarProyecto = async () => {
  try {
    loaderTitle.value = 'Procesando';
    loaderMsg.value = 'Indexando archivo';
    loaderModal.value?.abrirModal();

    const res = await storeIA.crearProyecto(
      nombreProyecto.value,
      descripcionProyecto.value,
      visibilidadProyecto.value,
      archivosSeleccionados.value,
      archivosGeonode.value
    );

    loaderModal.value?.cerrarModal();
    // Navega al proyecto guardado
    navigateTo(`/ia/proyecto/${res.id}`);
  } catch (error) {
    console.error('Error al guardar: ' + error.message);
  }
};

onMounted(() => {
  loadProjectList();
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <div class="overflowYAuto">
        <div class="positionSticky">
          <div class="fondo-color-acento p-x-3 p-y-1">
            <h5>Proyectos</h5>
          </div>

          <div class="p-x-3 p-t-3">
            <nuxt-link
              class="boton-listas boton boton-primario m-b-3"
              aria-label="Nuevo proyecto"
              to="/ia/proyectos/crear-nuevo"
            >
              Nuevo proyecto
            </nuxt-link>

            <ClientOnly>
              <form class="campo-busqueda" @submit.prevent>
                <input
                  id="idcampobusquedaialistas"
                  v-model="campoBusqueda"
                  class="campo-busqueda-entrada"
                  type="search"
                  :placeholder="'Buscar un proyecto'"
                  :disabled="catalogoFiltrado.length === 0"
                />
                <button
                  v-if="campoBusqueda"
                  class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                  aria-label="Borrar"
                  type="button"
                  :disabled="catalogoFiltrado.length === 0"
                  @click="removerBusquedaFiltro"
                >
                  <span aria-hidden="true" class="pictograma-cerrar" />
                </button>
                <button
                  class="boton-primario boton-pictograma campo-busqueda-buscar"
                  aria-label="Buscar"
                  type="button"
                  :disabled="catalogoFiltrado.length === 0"
                >
                  <span class="pictograma-buscar" aria-hidden="true" />
                </button>
              </form>
            </ClientOnly>
          </div>
        </div>

        <p v-if="catalogoFiltrado.length === 0" class="m-x-3">
          Cuando crees un proyecto, aparecerá en esta sección.
        </p>
        <div v-else>
          <p class="m-x-3">Selecciona un proyecto para ver su contenido.</p>
          <ul class="lista-chats lista-sin-estilo">
            <li
              v-for="proyecto in catalogoFiltrado"
              :key="`proyecto-${proyecto.id}`"
              class="m-0"
              @click="seleccionarProyecto(proyect)"
            >
              <div class="proyecto p-l-4 p-r-2 p-y-1">
                <div class="proyecto-titulo m-b-1">{{ proyecto.title }}</div>
                <div class="flex">
                  <UiNumeroElementos :numero="proyecto.numero_contextos" etiqueta="Contextos" />
                  <UiNumeroElementos :numero="proyecto.numero_fuentes" etiqueta="Fuentes" />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 p-t-3 overflowYAuto">
        <h2>Crear un nuevo proyecto</h2>

        <div class="grid">
          <div class="columna-10">
            <form action="">
              <ClientOnly>
                <SisdaiCampoBase
                  v-model="nombreProyecto"
                  etiqueta="Nombre del proyecto"
                  ejemplo="Escribe el nombre de tu proyecto"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="true"
                  class="m-b-3"
                />
                <SisdaiAreaTexto
                  v-model="descripcionProyecto"
                  etiqueta="Descripción del proyecto"
                  ejemplo="Describe brevemente tu proyecto"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="false"
                  class="m-b-3"
                />
                <SisdaiGrupoBotonesRadio leyenda="Visibilidad">
                  <SisdaiBotonRadio
                    v-model="visibilidadProyecto"
                    etiqueta="Público"
                    value="publico"
                    name="visibilidad"
                  />
                  <SisdaiBotonRadio
                    v-model="visibilidadProyecto"
                    etiqueta="Privado"
                    value="privado"
                    name="visibilidad"
                  />
                </SisdaiGrupoBotonesRadio>
              </ClientOnly>
            </form>
          </div>
        </div>

        <div class="grid">
          <div class="columna-16">
            <p class="borde-b" />
            <div class="flex flex-contenido-separado fuentes-encabezado">
              <h2>Agregar fuentes de información</h2>

              <div>
                <button
                  class="boton-pictograma boton-primario m-r-2"
                  aria-label="Agregar fuentes del catalogo"
                  @click="agregarFuentesCatalogo"
                >
                  Agregar del catálogo
                  <span class="pictograma-agregar" aria-hidden="true" />
                </button>

                <button
                  class="boton-pictograma boton-primario"
                  aria-label="Subir archivos"
                  @click="$refs.fileInput.click()"
                >
                  Subir archivos
                  <span class="pictograma-archivo-subir" aria-hidden="true" />
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".shp,.geojson,.csv,.kml,.zip,.pdf,.doc,.docx,.xls,.xlsx"
                  style="display: none"
                  @change="manejarSeleccionArchivos"
                />
              </div>
            </div>

            <div v-if="archivosTabla.length > 0" class="tabla-archivos m-y-3">
              <h3>Archivos a subir</h3>

              <table class="tabla">
                <thead>
                  <tr>
                    <th class="p-x-3 p-y-2">Nombre</th>
                    <th class="p-x-3 p-y-2">Tipo de archivo</th>
                    <th class="p-x-3 p-y-2">Categoría</th>
                    <th class="p-x-3 p-y-2">Origen</th>
                    <th class="p-x-3 p-y-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="archivo in archivosTabla" :key="`fila-${archivo.id}`">
                    <td class="p-3">{{ archivo.nombre }}</td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">{{ archivo.tipo }}</span>
                    </td>
                    <td class="p-3 flex flex-contenido-centrado">
                      <div
                        class="texto-centrado fondo-color-acento p-1 m-0 texto-color-acento borde borde-redondeado-12"
                        style="width: max-content"
                      >
                        <span v-if="archivo.category === 'documents'">
                          <span class="pictograma-documento" />{{ dictCategoria[archivo.category] }}
                        </span>
                        <span v-if="archivo.category === 'datasets'">
                          <span class="pictograma-tabla" />{{ dictCategoria[archivo.category] }}
                        </span>
                      </div>
                    </td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">{{
                        archivo.origen === 'Catalogo' ? 'Catálogo' : archivo.origen
                      }}</span>
                    </td>
                    <td class="p-x-3 p-y-1">
                      <button
                        class="boton-pictograma boton-secundario boton-chico"
                        aria-label="Eliminar archivo"
                        @click="eliminarArchivo(archivo.id)"
                      >
                        <span class="pictograma-eliminar" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex flex-contenido-final m-b-5">
              <NuxtLink
                class="boton boton-chico boton-primario"
                aria-label="Guardar proyecto"
                @click.prevent="guardarProyecto"
              >
                Guardar proyecto
              </NuxtLink>

              <button
                type="button"
                class="boton boton-chico boton-secundario"
                aria-label="Cancelar"
                @click="router.back"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <SisdaiModal ref="agregaCatalogoModal">
          <template #encabezado>
            <h2>Agregar información del catálogo</h2>
          </template>

          <template #cuerpo>
            <p>Selecciona el tipo de fuente de información que deseas agregar a tu proyecto</p>

            <form @keydown.enter.prevent="siguenteAgregar">
              <SisdaiGrupoBotonesRadio class="radio-catalogo" leyenda="" :es_vertical="true">
                <SisdaiBotonRadio
                  v-model="resourceType"
                  etiqueta="Tabulados de datos"
                  value="dataTable"
                  name="tipodefuente"
                  :es_obligatorio="true"
                />
                <SisdaiBotonRadio
                  v-model="resourceType"
                  etiqueta="Documentos"
                  value="document"
                  name="tipodefuente"
                  :es_obligatorio="true"
                />
              </SisdaiGrupoBotonesRadio>
            </form>
          </template>

          <template #pie>
            <button class="boton-primario boton-chico" type="button" @click="siguenteAgregar">
              Siguiente
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="seleccionCatalogoModal" class="modal-grande">
          <template #encabezado>
            <h2>Agregar {{ dictTipoRecurso[resourceType] }} del catálogo</h2>
          </template>

          <template #cuerpo>
            <div class="p-r-2">
              <p>Explora el catálogo y selecciona fuentes de información para el proyecto</p>

              <ClientOnly>
                <form class="campo-busqueda m-y-3" @submit.prevent="buscarRecurso">
                  <input
                    id="idcampobusquedaialistas"
                    v-model="inputSearch"
                    class="campo-busqueda-entrada"
                    type="search"
                    placeholder="Buscar del catálogo"
                  />
                  <button
                    class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                    aria-label="Borrar"
                    type="button"
                    @click="removerBusqueda"
                  >
                    <span aria-hidden="true" class="pictograma-cerrar" />
                  </button>
                  <button
                    class="boton-primario boton-pictograma campo-busqueda-buscar"
                    aria-label="Buscar"
                    type="button"
                    @click="buscarRecurso"
                  >
                    <span class="pictograma-buscar" aria-hidden="true" />
                  </button>
                </form>
                <p class="formulario-ayuda">{{ mensajeAyudaBuscador }}</p>
              </ClientOnly>

              <div class="flex flex-contenido-separado">
                <div class="columna-5">
                  <div>
                    <UiNumeroElementos
                      :numero="Object.keys(categoriesDict).length"
                      :etiqueta="
                        Object.keys(categoriesDict).length === 1 ? 'Categoría' : 'Categorías'
                      "
                      class="m-b-3"
                    />
                    <ul
                      v-if="Object.keys(categoriesDict).length > 0"
                      class="lista-sin-estilo overflowYAutoHeight"
                    >
                      <li
                        v-for="categoria in Object.keys(categoriesDict)"
                        :key="categoriesDict[categoria].name + '-key'"
                        class="m-y-0"
                      >
                        <button
                          class="categoria p-l-6 p-r-2 p-y-1"
                          :class="{
                            seleccionada: categoriesDict[categoria].label === categoriaSeleccionada,
                          }"
                          @click="seleccionarCategoria(categoria)"
                        >
                          {{ categoriesDict[categoria].inSpanish }}
                        </button>
                      </li>
                    </ul>
                    <div v-else class="flex flex-contenido-centrado">
                      <figure class="">
                        <img
                          class="color-invertir"
                          src="/img/loader.gif"
                          alt="Loader de SIGIC"
                          height="128px"
                        />
                        <figcaption class="texto-centrado">Cargando categorías</figcaption>
                      </figure>
                    </div>
                  </div>
                </div>

                <div class="columna-5">
                  <div>
                    <UiNumeroElementos
                      :numero="totalCategoria"
                      :etiqueta="
                        dictTipoRecurso[resourceType].charAt(0).toUpperCase() +
                        (totalCategoria === 1
                          ? dictTipoRecurso[resourceType].slice(1, -1)
                          : dictTipoRecurso[resourceType].slice(1))
                      "
                      class="m-b-3"
                    />
                    <div v-if="recursosCargando" class="flex flex-contenido-centrado">
                      <figure class="">
                        <img
                          class="color-invertir"
                          src="/img/loader.gif"
                          alt="Loader de SIGIC"
                          height="128px"
                        />
                        <figcaption class="texto-centrado">Cargando recursos</figcaption>
                      </figure>
                    </div>
                    <ul class="lista-sin-estilo overflowYAutoHeight">
                      <li v-for="(recurso, index) in recursos" :key="index" class="m-y-0">
                        <IaElementoCatalogo
                          :key="index"
                          :catalogue-element="recurso"
                          :resource-type="resourceType"
                          @trigger-fetch="fetchNewData"
                        />
                      </li>
                      <figure
                        v-if="
                          categoriaSeleccionada && categoriesDict[categoriaSeleccionada].isLoading
                        "
                        class="flex flex-contenido-centrado"
                      >
                        <img
                          class="color-invertir"
                          src="/img/loader.gif"
                          alt="Loader de SIGIC"
                          height="64px"
                        />
                      </figure>
                    </ul>
                  </div>
                </div>

                <div class="columna-5">
                  <div>
                    <UiNumeroElementos
                      :numero="recursosSeleccionados.length"
                      :etiqueta="
                        dictTipoRecurso[resourceType].charAt(0).toUpperCase() +
                        (resourceType === 'document'
                          ? recursosSeleccionados.length === 1
                            ? dictTipoRecurso[resourceType].slice(1, -1) + ' seleccionado'
                            : dictTipoRecurso[resourceType].slice(1) + ' seleccionados'
                          : recursosSeleccionados.length === 1
                            ? dictTipoRecurso[resourceType].slice(1, -1) + ' seleccionada'
                            : dictTipoRecurso[resourceType].slice(1) + ' seleccionadas')
                      "
                      class="m-b-3"
                    />
                    <ul class="lista-sin-estilo overflowYAutoHeight">
                      <li
                        v-for="(recurso, index) in recursosSeleccionados"
                        :key="index"
                        class="m-y-0"
                      >
                        <div class="capa p-2 m-b-2 borde-redondeado-20">
                          <p class="m-t-0 m-b-1">{{ recurso.title }}</p>
                          <div class="m-b-1">
                            {{ categoriesDict[recurso.category.gn_description]?.inSpanish }}
                          </div>
                          <div class="icono">
                            <span
                              v-globo-informacion:derecha="recurso.raw_abstract"
                              class="pictograma-informacion pictograma-mediano picto m-r-1"
                              aria-hidden="true"
                            />
                          </div>
                          <div class="flex flex-contenido-final">
                            <button
                              class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
                              aria-label="Remover recurso seleccionado"
                              type="button"
                              @click="storeResources.removeSelectedByPk(recurso.pk, resourceType)"
                            >
                              <span class="pictograma-eliminar" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <template #pie>
            <button
              class="boton-primario boton-chico"
              type="button"
              :disabled="recursosSeleccionados.length === 0"
              @click="cargarArchivosGeonode"
            >
              Aceptar
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal id="loaderModal" ref="loaderModal">
          <template #encabezado>
            <h1 class="m-t-0 texto-tamanio-6">{{ loaderTitle }}</h1>
          </template>

          <template #cuerpo>
            <div class="flex flex-contenido-centrado">
              <figure>
                <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
                <figcaption class="texto-centrado">{{ loaderMsg }}</figcaption>
              </figure>
            </div>
          </template>

          <template #pie> </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.overflowYAuto {
  height: var(--altura-consulta-esc);
  overflow-y: auto;

  .positionSticky {
    position: sticky;
    top: 0;
    background-color: var(--fondo);
    padding-bottom: 8px;
  }
}

.proyecto {
  cursor: pointer;
  border-left: var(--Escalas-Bordes-borde-8, 8px) solid transparent;

  // &.seleccionado {
  //   border-left: var(--Escalas-Bordes-borde-8, 8px) solid var(--borde-acento);
  //   background: var(--fondo-acento);
  // }

  .proyecto-titulo {
    color: var(--navegacion-secundaria-color);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
  }
}

.fuentes-encabezado {
  align-items: center;
}

.tabla {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: center;
  }

  th {
    border-bottom: 1px solid var(--borde);
    text-align: center;
    font-size: var(--Tipos-Tamao-Prrafos-Prrafo-base, 16px);
    font-style: normal;
    font-weight: 600;
    line-height: var(--Tipos-Interlineado-Prrafos-Prrafos, 24px);
  }

  tr:last-child td {
    border-bottom: none;
  }

  .etiqueta-tabla span {
    border-radius: var(--Escalas-Bordes-redondeados-br-2, 8px);
    border: 1px solid var(--Base-Borde---borde-acento, #53323c);
    background: var(--Base-Fondo---fondo-acento, #fcf3f5);

    color: var(--Base-Tipografa---texto-secundario, #5f3e47);
    font-size: var(--Tipos-Tamao-Prrafos-Prrafo-base, 16px);
    font-style: normal;
    font-weight: 400;
    line-height: var(--Tipos-Interlineado-Prrafos-Prrafos, 24px);
  }
}

.radio-catalogo {
  .grupo-formulario {
    flex-direction: column;
  }
}

.overflowYAutoHeight {
  overflow-y: auto;
  height: 300px;
}

.categoria {
  border-radius: inherit;
  width: 100%;
  background: var(--navegacion-secundaria-fondo);
  color: var(--navegacion-secundaria-activo-borde);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  text-align: inherit;
  cursor: pointer;

  &.seleccionada,
  &:focus,
  &:hover {
    border-left: 8px solid var(--navegacion-secundaria-activo-borde);
    background: var(--navegacion-secundaria-activo-fondo);
  }
}

.capa {
  background: var(--fondo-acento);
  color: var(--texto-secundario);

  font-style: normal;
  font-weight: 500;
  line-height: 20px;

  .icono {
    display: flex;
    align-items: center;
  }
}

//barra ed progreso. TODO: estilo sisdai
.upload-progress {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--fondo-acento);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-progress progress {
  width: 100%;
  height: 20px;
}

.upload-progress span {
  text-align: center;
  font-size: 0.9rem;
}

.boton[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

dialog#loaderModal.modal .modal-contenedor .modal-cerrar {
  display: none;
}

// .overflowYAuto {
//   // overflow-y: auto;
//   // height: var(--altura-consulta-esc);
// }
</style>
