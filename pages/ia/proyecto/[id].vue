<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiGrupoBotonesRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

import { buildUrl, categoriesInSpanish } from '~/utils/consulta';

const config = useRuntimeConfig();
const storeFilters = useFilteredResources();
const storeResources = useResourcesIAStore();
const { gnoxyFetch } = useGnoxyUrl();

const resourceType = ref('dataLayer');
const recursos = computed(() => storeResources.resources[resourceType.value]);
const recursosSeleccionados = computed(() => storeResources.selectedResources[resourceType.value]);

const agregaCatalogoModal = ref(null);
const seleccionCatalogoModal = ref(null);
const dictTipoRecurso = {
  dataLayer: 'capas',
  dataTable: 'tablas',
  document: 'documentos',
};
const geomDict = {
  Point: { tooltipText: 'Capa de puntos', class: 'pictograma-capa-puntos' },
  MultiPoint: {
    tooltipText: 'Capa de puntos',
    class: 'pictograma-capa-puntos',
  },
  Polygon: {
    tooltipText: 'Capa de poligonos',
    class: 'pictograma-capa-poligono',
  },
  MultiPolygon: {
    tooltipText: 'Capa de poligonos',
    class: 'pictograma-capa-poligono',
  },
  LineString: {
    tooltipText: 'Capa de lineas',
    class: 'pictograma-capa-lineas',
  },
  LinearRing: {
    tooltipText: 'Capa de lineas',
    class: 'pictograma-capa-lineas',
  },
  MultiLineString: {
    tooltipText: 'Capa de lineas',
    class: 'pictograma-capa-lineas',
  },
  GeometryCollection: {
    tooltipText: 'Colección de geometrías',
    class: 'pictograma-capa-poligono',
  },
  Raster: {
    tooltipText: 'Raster',
    class: 'pictograma-capas',
  },
  Otro: {
    tooltipText: 'Indefinido',
    class: 'pictograma-flkt',
  },
  Remoto: {
    tooltipText: 'Capa remota',
    class: 'pictograma-colaborar',
  },
  Error: {
    tooltipText: 'No se pudo recuperar la información',
    class: 'pictograma-alerta',
  },
};

const archivosSeleccionados = ref([]);
const categoriaSeleccionada = ref(null);
const archivosGeonode = ref([]);
const archivosTabla = ref([]);

const totalResources = ref(0);
const params = computed(() => storeFilters.filters.queryParams);
const apiCategorias = `${config.public.geonodeApi}/facets/category`;
const categoriesDict = ref({});
const totalCategoria = ref(0);
const nthElement = 1;

async function fetchTotalByCategory(category) {
  const preParams = params.value;
  preParams['filter{category.identifier.in}'] = category;
  const url = buildUrl(`${config.public.geonodeApi}/resources`, preParams);
  const request = await gnoxyFetch(url.toString());
  const res = await request.json();
  return res.total;
}

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
  await callResources(categoriaSeleccionada.value);
  storeResources.setNthElements(resourceType.value, [
    recursos.value[recursos.value.length - nthElement].pk,
  ]);
}

function cargarArchivosGeonode() {
  seleccionCatalogoModal?.value.cerrarModal();
  // console.log('recursosSeleccionados', recursosSeleccionados.value);
  const nuevosArchivos = recursosSeleccionados.value.map((file) => ({
    id: Math.floor(Math.random() * 1000000000000000000000),
    nombre: file.title,
    tipo: obtenerTipoArchivo(file.title),
    // archivo: file, // Objeto File original
    archivo: null,
    categoria:
      resourceType.value === 'document'
        ? 'Documento'
        : resourceType.value === 'dataLayer'
          ? 'Capa'
          : 'Tabla',
    origen: 'Catálogo',
    download_url: file.download_url,
    embed_url: file.embed_url,
    pk: file.pk,
    uuid: file.uuid,
    category:
      resourceType.value === 'document'
        ? 'Documento'
        : resourceType.value === 'dataLayer'
          ? 'Capa'
          : 'Tabla',
    alternate: file.alternate,
    links_csv: file.links.filter((d) => d.extension === 'csv'), // para las tablas
  }));

  archivosGeonode.value = [...archivosGeonode.value, ...nuevosArchivos];
  archivosTabla.value = [...archivosSeleccionados.value, ...archivosGeonode.value];
}

async function seleccionarCategoria(categoria) {
  if (categoriaSeleccionada.value !== categoriesDict.value[categoria].label) {
    totalCategoria.value = 0;
    storeResources.resetByType(resourceType.value);
    categoriesDict.value[categoria].page = 1;
    categoriaSeleccionada.value = categoriesDict.value[categoria].label;
    storeFilters.updateFilter('categories', [categoriesDict.value[categoria].name]);
    await storeFilters.buildQueryParams(resourceType.value);
    await storeResources.fetchByCategory(resourceType.value, 1, params.value);
    storeResources.setNthElements(resourceType.value, [
      recursos.value[recursos.value.length - nthElement].pk,
    ]);
    totalCategoria.value = categoriesDict.value[categoriaSeleccionada.value].total;
  }
}

watch(resourceType, async (nv, ov) => {
  storeResources.resetSelectedByType(ov);
  storeResources.resetByType(ov);
  totalCategoria.value = 0;
  storeFilters.buildQueryParams(nv);
  await buildCategoriesDict();
});

const storeIA = useIAStore();

// Datos del formulario
const nombreProyecto = ref('');
const descripcionProyecto = ref('');
const visibilidadProyecto = ref('publico'); // Valor por defecto

const route = useRoute();
const esEdicion = ref(false);

const proyecto = ref(null);

const archivosEliminados = ref([]);

const loaderModal = ref(null);
const loaderTitle = ref('');
const loaderMsg = ref('');

onMounted(async () => {
  storeFilters.buildQueryParams(resourceType.value);
  await buildCategoriesDict();

  loaderTitle.value = 'Cargando';
  loaderMsg.value = 'Espere un momento';
  await nextTick();
  loaderModal.value?.abrirModal();

  if (route.params.id !== 'nuevo') {
    esEdicion.value = true;

    proyecto.value = await storeIA.getProjectById(route.params.id);

    nombreProyecto.value = proyecto.value.workspace.title;
    descripcionProyecto.value = proyecto.value.workspace.description;
    visibilidadProyecto.value = proyecto.value.workspace.public ? 'publico' : 'privado';

    const arraySources = await storeIA.getProjectSources(route.params.id);

    const archivosBackend = arraySources.map((archivo) => ({
      id: archivo.id,
      nombre: archivo.filename,
      tipo: obtenerTipoArchivo(archivo.filename),
      archivo: null,
      categoria: archivo.geonode_category,
      origen: archivo.geonode_type,
    }));
    // console.log('arraySources', arraySources);

    archivosSeleccionados.value = [...archivosSeleccionados.value, ...archivosBackend];
    archivosTabla.value = [...archivosSeleccionados.value];
  }

  window.addEventListener('keydown', preventEscape);

  loaderModal.value?.cerrarModal();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', preventEscape);
});

// Método para manejar la selección de archivos
const manejarSeleccionArchivos = (event) => {
  const nuevosArchivos = Array.from(event.target.files).map((file) => ({
    // id: Date.now() + Math.random().toString(36).substr(2, 9),
    id: Math.floor(Math.random() * 1000000000000000000000),
    nombre: file.name,
    tipo: obtenerTipoArchivo(file.name),
    archivo: file, // Objeto File original
    categoria: 'Archivo',
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
    // Mostrar notificación de inicio
    /*     notificacion.mostrar({
      tipo: 'info',
      mensaje: 'Iniciando subida del proyecto...',
      duracion: 3000
    }); */

    await storeIA.crearProyecto(
      nombreProyecto.value,
      descripcionProyecto.value,
      visibilidadProyecto.value,
      archivosSeleccionados.value,
      archivosGeonode.value
    );

    // Notificación de éxito
    //alert("Proyecto guardado correctamente")
    console.log('Proyecto guardado correctamente');

    loaderModal.value?.cerrarModal();
    /*    notificacion.mostrar({
      tipo: 'exito',
      mensaje: 'Proyecto guardado correctamente',
      duracion: 5000
    }); */

    navigateTo('/ia/proyectos');
  } catch (error) {
    //alert('Error al guardar: ' + error.message);
    console.error('Error al guardar: ' + error.message);
    /* notificacion.mostrar({
      tipo: 'error',
      mensaje: 'Error al guardar: ' + error.message,
      duracion: 7000,
    }); */
  }
};

const editarProyecto = async () => {
  try {
    loaderTitle.value = 'Procesando';
    loaderMsg.value = 'Indexando archivo';
    loaderModal.value?.abrirModal();

    await storeIA.actualizarProyecto(
      nombreProyecto.value,
      descripcionProyecto.value,
      visibilidadProyecto.value,
      archivosSeleccionados.value,
      archivosEliminados.value,
      route.params.id,
      archivosGeonode.value
    );

    loaderModal.value?.cerrarModal();

    navigateTo('/ia/proyectos');
  } catch (error) {
    console.error('Error al actualizar: ' + error.message);
  }
};

function preventEscape(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
  }
}
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <IaLayoutListas
        titulo="Proyectos"
        texto-boton="Nuevo proyecto"
        etiqueta-busqueda="Buscar un proyecto"
      />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 p-t-3 overflowYAuto">
        <h2>Configuración de proyecto</h2>
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
            <p class="seperador borde-b" />
            <div class="flex flex-contenido-separado fuentes-encabezado">
              <h2>Agregar fuentes de información</h2>
              <div>
                <button
                  class="boton-pictograma boton-primario m-r-2"
                  aria-label="Agregar fuentes del catalogo"
                  @click="agregaCatalogoModal?.abrirModal()"
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
                  <tr v-for="archivo in archivosTabla" :key="archivo.id">
                    <td class="p-3">{{ archivo.nombre }}</td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">{{ archivo.tipo }}</span>
                    </td>
                    <td class="p-3 flex flex-contenido-centrado">
                      <p
                        class="texto-centrado fondo-color-acento p-1 texto-color-acento borde borde-redondeado-12"
                        style="width: max-content"
                      >
                        <span v-if="archivo.categoria === 'Documento'">
                          <span class="pictograma-documento" />{{ archivo.categoria }}
                        </span>

                        <span v-if="archivo.categoria === 'Tabla'">
                          <span class="pictograma-tabla" />{{ archivo.categoria }}
                        </span>
                      </p>
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
                @click.prevent="esEdicion ? editarProyecto() : guardarProyecto()"
              >
                Guardar proyecto
              </NuxtLink>
              <nuxt-link
                class="boton boton-chico boton-secundario"
                aria-label="Cancelar"
                to="/ia/proyectos/"
              >
                Cancelar
              </nuxt-link>
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
            <form
              @keydown.enter.prevent="
                agregaCatalogoModal.cerrarModal();
                seleccionCatalogoModal.abrirModal();
              "
            >
              <SisdaiGrupoBotonesRadio class="radio-catalogo" leyenda="" :es_vertical="true">
                <SisdaiBotonRadio
                  v-model="resourceType"
                  etiqueta="Capas geográficas"
                  value="dataLayer"
                  name="tipodefuente"
                  :es_obligatorio="true"
                />
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
            <button
              class="boton-primario boton-chico"
              type="button"
              @click="
                agregaCatalogoModal.cerrarModal();
                seleccionCatalogoModal.abrirModal();
              "
            >
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
              <!-- <ClientOnly>
                <form class="campo-busqueda m-y-3" @submit.prevent>
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
              </ClientOnly> -->

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
                    <p v-else>...cargando</p>
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
                    <ul class="lista-sin-estilo overflowYAutoHeight">
                      <li v-for="(recurso, index) in recursos" :key="index" class="m-y-0">
                        <IaElementoCatalogo
                          :key="index"
                          :catalogue-element="recurso"
                          :resource-type="resourceType"
                          @trigger-fetch="fetchNewData"
                        />
                      </li>
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
                          <div v-if="resourceType === 'dataLayer'" class="icono">
                            <span
                              class="m-r-1"
                              :class="[
                                geomDict[recurso.geomType].class,
                                'pictograma-mediano picto',
                              ]"
                              aria-hidden="true"
                            />
                            <span>{{ geomDict[recurso.geomType].tooltipText }}</span>
                          </div>
                          <div v-else class="icono">
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
                <img src="/img/loader.gif" alt="Loader de SIGIC" />
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

<style lang="scss">
.overflowYAuto {
  overflow-y: auto;
  height: var(--altura-consulta-esc);
}
.overflowYAutoHeight {
  overflow-y: auto;
  height: 300px;
}

.separador {
  width: 100%;
  height: 1px;
  background: #aaa;
}

.fuentes-encabezado {
  align-items: center;
}

.radio-catalogo {
  .grupo-formulario {
    flex-direction: column;
  }
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

.tabla {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    /* padding: 0.75rem 1rem; */
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
</style>
