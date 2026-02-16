<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

import { cleanInput } from '~/utils/consulta';
const router = useRouter();
const route = useRoute();
const config = useRuntimeConfig();

const storeIA = useIAStore();
const idSeleccionado = computed(() => route.params.id);
const proyecto = ref({});

const catalogo = ref([]);
const catalogoFiltrado = ref(catalogo.value);
const campoBusqueda = ref('');

const arraySources = ref([]);
const contextos = ref([]);

const dictCategoria = {
  datasets: 'Datos tabulados',
  documents: 'Documentos',
};

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

// Método para remover la búsqueda en el filtro de proyectos
function removerBusquedaFiltro() {
  campoBusqueda.value = '';
  catalogoFiltrado.value = catalogo.value;
}

// Función para cargar proyecto por id
const loadProjectById = async () => {
  //Consulta proyecto
  await storeIA.getProjectById(+idSeleccionado.value);
  proyecto.value = await storeIA.proyectoSeleccionado;
};

// Función para cargar las fuentes del proyecto
const loadSources = async () => {
  //Consulta fuentes
  arraySources.value = await storeIA.getProjectSources(+idSeleccionado.value);
};

// Función para cargar las contextos proyecto
const loadContexts = async () => {
  //Consulta fuentes
  contextos.value = await storeIA.getProjectContexts(+idSeleccionado.value);

  if (contextos.value.length > 0) {
    storeIA.existeContexto = true;
  } else {
    storeIA.existeContexto = false;
  }
};

onMounted(() => {
  loadProjectList();
  loadProjectById();
});

watch(
  proyecto,
  (nuevo) => {
    if (nuevo?.id) {
      loadSources();
      loadContexts();
    }
  },
  { immediate: true }
); // Esto lo ejecuta también en el primer render

// Observador carga fuentes al cambiar de proyecto
watch(proyecto, () => {
  if (proyecto.value?.id) {
    loadSources();
    loadContexts();
  }
});

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

const resourceFilename = ref('');
const modalNoPublico = ref(null);

const modalDocumento = ref(null);
const blobeTitle = ref('');
const modalDocResourcePk = ref();
const isDocumentoReading = ref(false);
const idDocGuardado = ref();
/**
 * Abre un modal con la vista del documento embed
 * @param resource del que se toma el pk para la visualización
 */
async function openResourceViewEmbed(resource) {
  if (idDocGuardado.value === resource.geonode_id) {
    isDocumentoReading.value = true;
  } else {
    idDocGuardado.value = resource.geonode_id;
    isDocumentoReading.value = false;
  }

  blobeTitle.value = resource.filename;
  modalDocResourcePk.value = resource.geonode_id;

  if (modalDocResourcePk.value !== 0) {
    nextTick(() => {
      modalDocumento.value?.abrirModal();
    });
  } else {
    isDocumentoReading.value = false;
    resourceFilename.value = resource.filename;
    modalNoPublico.value?.abrirModal();
    console.warn(`El recurso "${resource.filename}" no está público.`);
  }
}

const modalTabla = ref(null);
const tableTitle = ref('');
const modalTableResourcePk = ref('');
const isDataTableReading = ref(false);
const idTablaGuardado = ref();
/**
 * Abre un modal con la vista del tabla de atributos
 * @param resource del que se toma el pk para la visualización
 */
async function openResourceViewTable(resource) {
  if (idTablaGuardado.value === resource.geonode_id) {
    isDataTableReading.value = true;
  } else {
    idTablaGuardado.value = resource.geonode_id;
    isDataTableReading.value = false;
  }

  tableTitle.value = resource.filename;
  modalTableResourcePk.value = resource.geonode_id;

  if (modalTableResourcePk.value !== 0) {
    nextTick(() => {
      modalTabla.value?.abrirModal();
    });
  } else {
    isDataTableReading.value = false;
    resourceFilename.value = resource.filename;
    modalNoPublico.value?.abrirModal();

    console.warn(`El recurso "${resource.filename}" no está público.`);
  }
}

const eliminarModal = ref(null);
const eliminarLabel = ref('proyecto');
const delete_id = ref(null);

// Método para abrir modal para remover
function openEliminarModal(element_id, type) {
  eliminarLabel.value = type;
  eliminarModal.value?.abrirModal();

  delete_id.value = element_id;
}

// Método para remover contexto o proyecto
const handleDelete = async () => {
  console.log('eliminar', eliminarLabel.value, delete_id.value);

  if (eliminarLabel.value === 'contexto') {
    await storeIA.eliminarContexto(delete_id.value);

    loadContexts();
  } else {
    await storeIA.eliminarProyecto(delete_id.value);

    storeIA.triggerProjectReload();

    // Navega al proyecto anterior más reciente
    router.push(`/ia/proyecto/${catalogo.value[1].id}`);
  }

  eliminarModal.value?.cerrarModal();
};

watch(campoBusqueda, (nv) => {
  // filtra lista de catálogo proyectos por título
  if (nv !== '') {
    catalogoFiltrado.value = catalogoFiltrado.value.filter((resource) =>
      cleanInput(resource.title).includes(nv)
    );
  } else {
    catalogoFiltrado.value = catalogo.value;
  }
});

watch(
  () => storeIA.projectsVersion,
  () => {
    loadProjectList();
  }
);
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <div>
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
                  />
                  <button
                    v-if="campoBusqueda"
                    class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                    aria-label="Borrar"
                    type="button"
                    @click="removerBusquedaFiltro"
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
          </div>

          <div>
            <p class="m-x-3">Selecciona un proyecto para ver su contenido.</p>
            <ul class="lista-chats lista-sin-estilo">
              <li
                v-for="proyect in catalogoFiltrado"
                :key="proyect.id"
                class="m-0"
                @click="seleccionarProyecto(proyect)"
              >
                <div
                  class="proyecto p-l-4 p-r-2 p-y-1"
                  :class="{
                    seleccionado: proyect.id === +idSeleccionado || proyect.title === '',
                  }"
                >
                  <div class="proyecto-titulo m-b-1">{{ proyect.title }}</div>
                  <div class="flex">
                    <UiNumeroElementos :numero="proyect.numero_contextos" etiqueta="Contextos" />
                    <UiNumeroElementos :numero="proyect.numero_fuentes" etiqueta="Fuentes" />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </template>

    <template #visualizador>
      <main id="principal" class="">
        <div>
          <div class="contenedor overflowYAuto">
            <div class="grid p-t-3">
              <div class="columna-16">
                <div class="flex flex-contenido-separado proyecto-encabezado">
                  <div class="flex proyecto-encabezado">
                    <h2>{{ proyecto.title }}</h2>

                    <p
                      class="p-x-1 p-y-minimo fondo-color-acento texto-color-secundario borde borde-color-acento borde-redondeado-8"
                    >
                      <span>{{ proyecto.public ? 'Público' : 'Privado' }}</span>
                      <!-- TODO: agregar icono de para privado/publico -->
                      <span class="pictograma-privado" aria-hidden="true" />
                    </p>
                  </div>

                  <div class="flex">
                    <nuxt-link
                      class="boton boton-secundario boton-chico"
                      aria-label="Configurar proyecto"
                      :to="`/ia/proyecto/${proyecto.id}/configurar`"
                    >
                      Configurar proyecto
                    </nuxt-link>

                    <button
                      class="boton boton-secundario boton-chico"
                      @click="openEliminarModal(proyecto.id, 'proyecto')"
                    >
                      Eliminar proyecto
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid">
              <div class="columna-10">
                {{ proyecto.description }}
              </div>
            </div>

            <div class="grid">
              <div class="columna-16">
                <p class="separador borde-b" />
              </div>
            </div>

            <div class="grid">
              <div class="flex flex-contenido-separado contexto-encabezado columna-16">
                <h4>Contextos:</h4>

                <NuxtLink
                  class="boton boton-primario boton-chico"
                  aria-label="Crear contexto"
                  :to="`/ia/proyecto/${proyecto.id}/crear-contexto`"
                >
                  Crear contexto
                </NuxtLink>
              </div>
            </div>

            <div class="grid">
              <div class="columna-16">
                <div v-if="storeIA.existeContexto">
                  <div class="flex m-y-3">
                    <div
                      v-for="contexto in contextos"
                      :key="`contexto-${contexto.id}`"
                      class="columna-4"
                    >
                      <div class="tarjeta">
                        <img
                          :src="`${config.public.geonodeUrl}/uploaded/ia/uploads/contexts/${contexto.image_type}`"
                          class="tarjeta-imagen"
                          alt="Imagen contexto"
                        />
                        <div class="tarjeta-cuerpo">
                          <p class="tarjeta-titulo">{{ contexto.title }}</p>
                          <UiNumeroElementos :numero="contexto.num_files" etiqueta="Fuentes" />
                        </div>
                        <div class="tarjeta-pie">
                          <button
                            class="boton boton-primario boton-chico flex flex-contenido-separado"
                            aria-label="Iniciar chat"
                            type="button"
                            @click="router.push(`/ia/chat/0/contexto/${contexto.id}`)"
                          >
                            Iniciar chat
                            <span class="pictograma-chat" aria-hidden="true" />
                          </button>

                          <nuxt-link
                            class="boton-secundario boton-chico"
                            type="button"
                            :to="`/ia/proyecto/${proyecto.id}/editar-contexto/${contexto.id}`"
                            @click="storeIA.seleccionarContexto(contexto)"
                          >
                            Editar contexto
                            <span class="pictograma-editar" aria-hidden="true" />
                          </nuxt-link>

                          <nuxt-link
                            class="boton-secundario boton-chico"
                            type="button"
                            @click="openEliminarModal(contexto.id, 'contexto')"
                          >
                            Eliminar contexto
                            <span class="pictograma-eliminar" aria-hidden="true" />
                          </nuxt-link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="flex flex-contenido-centrado">
                  <div class="columna-8">
                    <div class="nota fondo-color-neutro p-2 borde-redondeado-8 m-t-0">
                      <h6 class="m-t-0 m-b-2">Aún no hay contextos en este proyecto.</h6>

                      <p class="m-y-0">
                        Para comenzar, haz clic en "Crear contexto" y selecciona las fuentes que
                        quieres usar. Esto te permitirá activar el análisis dentro del chat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid m-b-5">
              <div class="columna-16">
                <p class="separador borde-b" />
                <div class="flex flex-contenido-separado fuentes-encabezado">
                  <h4>Fuentes de información:</h4>
                </div>

                <div v-if="arraySources.length > 0" class="tabla-archivos">
                  <table class="tabla">
                    <thead>
                      <tr>
                        <th class="p-x-3 p-y-2">Nombre</th>
                        <th class="p-x-3 p-y-2">Tipo de archivo</th>
                        <th>Categoría</th>
                        <th>Origen</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="archivo in arraySources" :key="archivo.id">
                        <td class="p-3">
                          <a
                            @click="
                              obtenerTipoArchivo(archivo.filename) === 'PDF'
                                ? openResourceViewEmbed(archivo)
                                : openResourceViewTable(archivo)
                            "
                            >{{ archivo.filename }}</a
                          >
                        </td>
                        <td class="p-3 etiqueta-tabla">
                          <span class="p-x-1 p-y-minimo">{{
                            obtenerTipoArchivo(archivo.filename)
                          }}</span>
                        </td>
                        <td class="p-3 flex flex-contenido-centrado">
                          <p
                            class="texto-centrado fondo-color-acento p-1 m-0 texto-color-acento borde borde-redondeado-12"
                            style="width: max-content"
                          >
                            <span v-if="archivo.geonode_category === 'Documento'">
                              <!-- propio -->
                              <span class="pictograma-documento" />{{ archivo.geonode_category }}s
                            </span>
                            <span v-if="archivo.geonode_category === 'documents'">
                              <!-- catalogo -->
                              <span class="pictograma-documento" />{{
                                dictCategoria[archivo.geonode_category]
                              }}
                            </span>
                            <span v-if="archivo.geonode_category === 'datasets'">
                              <span class="pictograma-tabla" />{{
                                dictCategoria[archivo.geonode_category]
                              }}
                            </span>
                          </p>
                        </td>
                        <td class="p-3 etiqueta-tabla">
                          <span class="p-x-1 p-y-minimo">
                            {{
                              archivo.geonode_type === 'Catalogo'
                                ? 'Catálogo'
                                : archivo.geonode_type
                            }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <ClientOnly>
            <SisdaiModal v-if="modalDocResourcePk" ref="modalDocumento" class="modal-grande">
              <template #encabezado>
                <h2>{{ isDocumentoReading ? blobeTitle : '' }}</h2>
              </template>

              <template #cuerpo>
                <div v-if="!isDocumentoReading" class="flex flex-contenido-centrado">
                  <figure>
                    <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
                    <figcaption class="texto-centrado">Cargando documento</figcaption>
                  </figure>
                </div>

                <IaDocFuentesInfo
                  :selected-element-pk="modalDocResourcePk"
                  @doc-cargado="isDocumentoReading = true"
                />
              </template>

              <template #pie> </template>
            </SisdaiModal>

            <SisdaiModal v-if="modalTableResourcePk" ref="modalTabla" class="modal-grande">
              <template #encabezado>
                <h2>{{ isDataTableReading ? tableTitle : '' }}</h2>
              </template>

              <template #cuerpo>
                <div v-if="!isDataTableReading" class="flex flex-contenido-centrado">
                  <figure>
                    <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
                    <figcaption class="texto-centrado">Cargando tabla</figcaption>
                  </figure>
                </div>

                <IaTablaFuentesInfo
                  :selected-element-pk="modalTableResourcePk"
                  @tabla-cargada="isDataTableReading = true"
                />
              </template>

              <template #pie> </template>
            </SisdaiModal>

            <SisdaiModal ref="modalNoPublico">
              <template #encabezado>
                <h2>{{ '' }}</h2>
              </template>

              <template #cuerpo>
                <p
                  class="fondo-color-alerta texto-color-alerta borde borde-color-alerta borde-redondeado-8 p-3"
                >
                  El recurso <b class="texto-peso-600">"{{ resourceFilename }}"</b> no está público
                  en geonode.
                  <nuxt-link to="/catalogo/mis-archivos/metadatos-pendientes"
                    >Ver en mis archivos</nuxt-link
                  >
                </p>
              </template>

              <template #pie> </template>
            </SisdaiModal>

            <SisdaiModal ref="eliminarModal">
              <template #encabezado>
                <h4>Eliminar {{ eliminarLabel }}</h4>
              </template>

              <template #cuerpo>
                <p>
                  ¿Deseas eliminar este {{ eliminarLabel }} de forma permanente? Una vez eliminado,
                  se borrará de la memoria y no se podrá recuperar.
                </p>
              </template>

              <template #pie>
                <button
                  type="button"
                  class="boton-secundario boton-chico"
                  @click="eliminarModal?.cerrarModal()"
                >
                  Cancelar
                </button>

                <button type="button" class="boton-primario boton-chico" @click="handleDelete">
                  Eliminar
                </button>
              </template>
            </SisdaiModal>
          </ClientOnly>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss">
.overflowYAuto {
  overflow-y: auto;
  height: var(--altura-consulta-esc);
}
.tarjeta {
  background-color: var(--fondo-neutro);
  .tarjeta-imagen {
    height: 120px;
  }
  .tarjeta-pie {
    display: inline-grid;
    a {
      display: flex;
      justify-content: space-between;
    }
  }
}

.proyecto-encabezado {
  align-items: center;
}

.separador {
  width: 100%;
  height: 1px;
  background: #aaa;
}

.contexto-encabezado {
  align-items: center;
}

.height-vh {
  height: var(--altura-consulta-esc);
}
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

  &.seleccionado {
    border-left: var(--Escalas-Bordes-borde-8, 8px) solid var(--borde-acento);
    background: var(--fondo-acento);
  }

  .proyecto-titulo {
    color: var(--navegacion-secundaria-color);
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
  }
}
</style>
