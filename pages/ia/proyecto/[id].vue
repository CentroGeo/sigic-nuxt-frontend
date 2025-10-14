<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiGrupoBotonesRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio-grupo/SisdaiBotonesRadioGrupo.vue';
import SisdaiBotonRadio from '@centrogeomx/sisdai-componentes/src/componentes/boton-radio/SisdaiBotonRadio.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasilla from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

import {
  categoriesInSpanish,
  cleanInput,
  fetchGeometryType,
  getWMSserver,
  hasWMS,
  resourceTypeDic,
  tooltipContent,
} from '~/utils/consulta';

const config = useRuntimeConfig();
const storeFilters = useFilteredResources();
const storeCatalogoResources = useResourcesCatalogoStore();

storeCatalogoResources.getTotalResources(
  resourceTypeDic.dataLayer,
  storeFilters.buildQueryParams(resourceTypeDic.dataLayer)
);
storeCatalogoResources.getTotalResources(
  resourceTypeDic.dataTable,
  storeFilters.buildQueryParams(resourceTypeDic.dataTable)
);
storeCatalogoResources.getTotalResources(
  resourceTypeDic.document,
  storeFilters.buildQueryParams(resourceTypeDic.document)
);

const filteredResources = ref([]);
const categorizedResources = ref({});

const agregaCatalogoModal = ref(null);
const botonRadioSeleccion = ref('dataLayer');

const seleccionCatalogoModal = ref(null);
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});
const selectedCategoryResourcesLength = ref(0);
const dictTipoRecurso = {
  dataLayer: 'capas',
  dataTable: 'tablas',
  document: 'documentos',
};
const etiquetaRecursos = ref(dictTipoRecurso[botonRadioSeleccion.value]);

const recursosSeleccionados = ref([]);
const buttons = ref([]);
const geomType = ref(null);
const optionsDict = {
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
const etiquetaRecursosSeleccionados = ref('');

const archivosSeleccionados = ref([]);
const categoriaSeleccionada = ref(null);

function groupResults() {
  categorizedResources.value = {};
  filteredResources.value.map((r) => {
    if (r.category) {
      const title = r.category.gn_description;
      if (Object.keys(categorizedResources.value).includes(title)) {
        categorizedResources.value[title].push(r);
      } else {
        categorizedResources.value[title] = [];
        categorizedResources.value[title].push(r);
      }
    } else {
      if (Object.keys(categorizedResources.value).includes('Sin Clasificar')) {
        categorizedResources.value['Sin Clasificar'].push(r);
      } else {
        categorizedResources.value['Sin Clasificar'] = [];
        categorizedResources.value['Sin Clasificar'].push(r);
      }
    }
  });
}
function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  groupResults();
}
function botonSiguiente() {
  agregaCatalogoModal.value?.cerrarModal();
  selectedCategoryResourcesLength.value = 0;
  recursosSeleccionados.value = [];
  etiquetaRecursos.value = dictTipoRecurso[botonRadioSeleccion.value];
  seleccionCatalogoModal.value?.abrirModal();
}
function asignarEtiquetaRecursos() {
  if (botonRadioSeleccion.value === 'dataLayer') {
    if (selectedCategoryResourcesLength.value === 1) {
      etiquetaRecursos.value = 'capa';
    } else {
      etiquetaRecursos.value = 'capas';
    }
  } else if (botonRadioSeleccion.value === 'dataTable') {
    if (selectedCategoryResourcesLength.value === 1) {
      etiquetaRecursos.value = 'tabla';
    } else {
      etiquetaRecursos.value = 'tablas';
    }
  } else if (botonRadioSeleccion.value === 'document') {
    if (selectedCategoryResourcesLength.value === 1) {
      etiquetaRecursos.value = 'documento';
    } else {
      etiquetaRecursos.value = 'documentos';
    }
  }
}
function removerRecursoSeleccionado(capa) {
  const index = recursosSeleccionados.value.indexOf(capa);
  if (index > -1) {
    recursosSeleccionados.value.splice(index, 1);
  }
}
function cargarArchivosASubir() {
  seleccionCatalogoModal?.value.cerrarModal();
  // TODO: fix tipo de archivo y archivo file para subir
  const nuevosArchivos = recursosSeleccionados.value.map((file) => ({
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    nombre: file.title,
    tipo: obtenerTipoArchivo(file.title),
    archivo: file, // Objeto File original
    categoria: 'Archivo',
    origen: 'Catálogo',
    // download_url: file.download_url,
    // embed_url: file.embed_url,
    // pk: file.pk,
  }));

  archivosSeleccionados.value = [...archivosSeleccionados.value, ...nuevosArchivos];
}

watch([inputSearch], async () => {
  updateResources(storeCatalogoResources.resourcesByType2[botonRadioSeleccion.value]);
});
watch(botonRadioSeleccion, async (nv) => {
  categoriaSeleccionada.value = null;
  storeFilters.filters.resourceType = nv;
  updateResources(storeCatalogoResources.resourcesByType2[nv]);
});
watch(recursosSeleccionados, () => {
  if (botonRadioSeleccion.value === 'dataLayer') {
    if (recursosSeleccionados.value.length === 1) {
      etiquetaRecursosSeleccionados.value = 'capa seleccionada';
    } else {
      etiquetaRecursosSeleccionados.value = 'capas seleccionadas';
    }
  } else if (botonRadioSeleccion.value === 'dataTable') {
    if (recursosSeleccionados.value.length === 1) {
      etiquetaRecursosSeleccionados.value = 'tabla seleccionada';
    } else {
      etiquetaRecursosSeleccionados.value = 'tablas seleccionadas';
    }
  } else if (botonRadioSeleccion.value === 'document') {
    if (recursosSeleccionados.value.length === 1) {
      etiquetaRecursosSeleccionados.value = 'documento seleccionada';
    } else {
      etiquetaRecursosSeleccionados.value = 'documentos seleccionados';
    }
  }
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
  loaderTitle.value = 'Cargando';
  loaderMsg.value = 'Espere un momento';
  await nextTick();
  loaderModal.value?.abrirModal();

  storeFilters.resetAll();
  storeFilters.filters.resourceType = botonRadioSeleccion.value;
  await storeCatalogoResources.getResourcesByType(resourceTypeDic.dataLayer);
  await storeCatalogoResources.getResourcesByType(resourceTypeDic.dataTable);
  await storeCatalogoResources.getResourcesByType(resourceTypeDic.document);
  updateResources(storeCatalogoResources.resourcesByType2[botonRadioSeleccion.value]);

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
      categoria: 'Archivo',
      origen: 'Propio',
    }));

    archivosSeleccionados.value = [...archivosSeleccionados.value, ...archivosBackend];
  }

  window.addEventListener('keydown', preventEscape);

  loaderModal.value?.cerrarModal();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', preventEscape);
});

const seleccionarCategoria = (categoria) => {
  categoriaSeleccionada.value = categoria;
  selectedCategoryResourcesLength.value =
    categorizedResources.value[categoriaSeleccionada.value].length || 0;

  asignarEtiquetaRecursos();

  // revisamos el tipo de geometría que tiene el recurso
  buttons.value = [];
  categorizedResources.value[categoriaSeleccionada.value].map(async (e) => {
    if (e.subtype === 'remote') {
      const resourceHasWMS = await hasWMS(e, 'geometry', config.public.geonodeUrl);
      if (resourceHasWMS) {
        const server = getWMSserver(e);
        geomType.value = await fetchGeometryType(e, server);
      } else {
        geomType.value = 'Remoto';
      }
    } else if (e.subtype === 'raster') {
      // Si es raster
      geomType.value = 'Raster';
    } else if (e.subtype === 'vector') {
      // Si es vectorial
      // Solicitamos la geometría hasta que la tarjeta va a entrar a la vista
      geomType.value = await fetchGeometryType(e, 'sigic');
    } else {
      geomType.value = 'Otro';
    }
    if (botonRadioSeleccion.value === 'dataLayer') {
      buttons.value.push({
        class: optionsDict[geomType.value].class,
        tooltipText: optionsDict[geomType.value].tooltipText,
      });
    } else {
      buttons.value.push({
        class: 'pictograma-informacion',
        tooltipText: tooltipContent(e),
      });
    }
  });
};

// Método para manejar la selección de archivos
const manejarSeleccionArchivos = (event) => {
  const nuevosArchivos = Array.from(event.target.files).map((file) => ({
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    nombre: file.name,
    tipo: obtenerTipoArchivo(file.name),
    archivo: file, // Objeto File original
    categoria: 'Archivo',
    origen: 'Propio',
  }));

  archivosSeleccionados.value = [...archivosSeleccionados.value, ...nuevosArchivos];
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
      archivosSeleccionados.value
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
    console.log('Error al guardar: ' + error.message);
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
      route.params.id
    );

    loaderModal.value?.cerrarModal();

    navigateTo('/ia/proyectos');
  } catch (error) {
    console.log('Error al actualizar: ' + error.message);
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
                <!-- botón "Subir archivos" -->
                <button
                  class="boton-pictograma boton-primario"
                  aria-label="Subir archivos"
                  @click="$refs.fileInput.click()"
                >
                  Subir archivos
                  <span class="pictograma-archivo-subir" aria-hidden="true" />
                </button>
                <!-- Input de archivo oculto -->
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

            <div v-if="archivosSeleccionados.length > 0" class="tabla-archivos m-y-3">
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
                  <tr v-for="archivo in archivosSeleccionados" :key="archivo.id">
                    <td class="p-3">{{ archivo.nombre }}</td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">{{ archivo.tipo }}</span>
                    </td>
                    <td class="p-3">{{ archivo.categoria }}</td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">{{ archivo.origen }}</span>
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
            <form @keydown.enter.prevent="botonSiguiente">
              <SisdaiGrupoBotonesRadio class="radio-catalogo" leyenda="" :es_vertical="true">
                <SisdaiBotonRadio
                  v-model="botonRadioSeleccion"
                  etiqueta="Capas geográficas"
                  value="dataLayer"
                  name="tipodefuente"
                  :es_obligatorio="true"
                />
                <SisdaiBotonRadio
                  v-model="botonRadioSeleccion"
                  etiqueta="Tabulados de datos"
                  value="dataTable"
                  name="tipodefuente"
                  :es_obligatorio="true"
                />
                <SisdaiBotonRadio
                  v-model="botonRadioSeleccion"
                  etiqueta="Documentos"
                  value="document"
                  name="tipodefuente"
                  :es_obligatorio="true"
                />
              </SisdaiGrupoBotonesRadio>
            </form>
          </template>
          <template #pie>
            <button class="boton-primario boton-chico" type="button" @click="botonSiguiente">
              Siguiente
            </button>
          </template>
        </SisdaiModal>

        <SisdaiModal ref="seleccionCatalogoModal" class="modal-grande">
          <template #encabezado>
            <h2>Agregar {{ dictTipoRecurso[botonRadioSeleccion] }} del catálogo</h2>
          </template>
          <template #cuerpo>
            <div class="p-r-2">
              <p>Explora el catálogo y selecciona fuentes de información para el proyecto</p>
              <ClientOnly>
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
              </ClientOnly>

              <div class="flex flex-contenido-separado">
                <div class="columna-5">
                  <div>
                    <UiNumeroElementos
                      :numero="Object.keys(categorizedResources).length"
                      etiqueta="Categorías"
                      class="m-b-3"
                    />
                    <ul
                      v-if="Object.keys(categorizedResources).length !== 0"
                      class="lista-sin-estilo"
                      style="overflow-y: auto"
                    >
                      <li
                        v-for="categoria in Object.keys(categorizedResources)"
                        :key="categoria + '-key'"
                        class="m-y-0"
                      >
                        <button
                          class="categoria p-l-6 p-r-2 p-y-1"
                          :class="{
                            seleccionada: categoria === categoriaSeleccionada,
                          }"
                          @click="seleccionarCategoria(categoria)"
                        >
                          {{ categoriesInSpanish[categoria] }}
                        </button>
                      </li>
                    </ul>
                    <p v-else>...cargando</p>
                  </div>
                </div>

                <div class="columna-5">
                  <div>
                    <UiNumeroElementos
                      :numero="
                        categoriaSeleccionada !== 'Sin Clasificar'
                          ? selectedCategoryResourcesLength
                          : 0
                      "
                      :etiqueta="etiquetaRecursos"
                      class="m-b-3"
                    />
                    <ul class="lista-sin-estilo" style="overflow-y: auto">
                      <li
                        v-for="(recurso, i) in categorizedResources[categoriaSeleccionada]"
                        :key="recurso.pk"
                        class="m-y-0"
                      >
                        <div
                          v-if="categoriaSeleccionada !== 'Sin Clasificar'"
                          class="capa p-2 m-b-2 borde-redondeado-20"
                        >
                          <SisdaiCasilla
                            v-model="recursosSeleccionados"
                            :etiqueta="recurso.title"
                            :value="recurso"
                          />
                          <div v-if="botonRadioSeleccion === 'dataLayer'" class="icono">
                            <span
                              class="m-r-1"
                              :class="[buttons[i]?.class, 'pictograma-mediano picto']"
                              aria-hidden="true"
                            />
                            <span>{{ buttons[i]?.tooltipText }}</span>
                          </div>
                          <div v-else class="icono">
                            <span
                              v-globo-informacion:derecha="buttons[i]?.tooltipText"
                              class="m-r-1"
                              :class="[buttons[i]?.class, 'pictograma-mediano picto']"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="columna-5">
                  <div>
                    <UiNumeroElementos
                      :numero="recursosSeleccionados.length || 0"
                      :etiqueta="etiquetaRecursosSeleccionados"
                      class="m-b-3"
                    />
                    <ul class="lista-sin-estilo" style="overflow-y: auto">
                      <li
                        v-for="(recurso, i) in recursosSeleccionados"
                        :key="recurso.id"
                        class="m-y-0"
                      >
                        <div class="capa p-2 m-b-2 borde-redondeado-20">
                          <h6 class="m-t-0 m-b-1">{{ recurso.title }}</h6>
                          <div class="m-b-1">
                            {{ recurso.category.gn_description }}
                          </div>
                          <div v-if="botonRadioSeleccion === 'dataLayer'" class="icono">
                            <span
                              class="m-r-1"
                              :class="[buttons[i]?.class, 'pictograma-mediano picto']"
                              aria-hidden="true"
                            />
                            <span>{{ buttons[i]?.tooltipText }}</span>
                          </div>
                          <div v-else class="icono">
                            <span
                              v-globo-informacion:derecha="buttons[i]?.tooltipText"
                              class="m-r-1"
                              :class="[buttons[i]?.class, 'pictograma-mediano picto']"
                              aria-hidden="true"
                            />
                          </div>
                          <div class="flex flex-contenido-final">
                            <button
                              class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
                              aria-label="Remover"
                              type="button"
                              @click="removerRecursoSeleccionado(recurso)"
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
              @click="cargarArchivosASubir"
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
