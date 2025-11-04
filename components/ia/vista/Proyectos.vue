<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const storeIA = useIAStore();

const proyecto = computed(() => storeIA.proyectoSeleccionado);
const arraySources = ref([]);

const contextos = ref([]);

const config = useRuntimeConfig();

const dictCategoria = {
  datasets: 'Datos tabulados',
  documents: 'Documentos',
};

// Función para cargar las fuentesl proyecto
const loadSources = async () => {
  //arraySources = [];

  //Consulta fuentes
  arraySources.value = await storeIA.getProjectSources(proyecto.value['id']);
  // console.log('arraySources.value', arraySources.value);

  //catalogo.value = arrayProjects;
  //catalogoFiltrado.value = arrayProjects;
};

// Función para cargar las contextos proyecto
const loadContexts = async () => {
  //arraySources = [];

  //Consulta fuentes
  contextos.value = await storeIA.getProjectContexts(proyecto.value['id']);
  if (contextos.value.length > 0) {
    storeIA.existeContexto = true;
  } else {
    storeIA.existeContexto = false;
  }

  //catalogo.value = arrayProjects;
  //catalogoFiltrado.value = arrayProjects;
};

//carga fuentes del proyecto inicialmente seleccionado
/* onMounted(() => {
  loadSources();
  loadContexts();
}); */

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
/**
 * Abre un modal con la vista del documento embed
 * @param resource del que se toma el pk para la visualización
 */
async function openResourceViewEmbed(resource) {
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
/**
 * Abre un modal con la vista del tabla de atributos
 * @param resource del que se toma el pk para la visualización
 */
async function openResourceViewTable(resource) {
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

function openEliminarModal(element_id, type) {
  eliminarLabel.value = type;
  eliminarModal.value?.abrirModal();

  delete_id.value = element_id;
}

const handleDelete = async () => {
  console.log(eliminarLabel.value);
  console.log(delete_id.value);
  if (eliminarLabel.value === 'contexto') {
    await storeIA.eliminarContexto(delete_id.value);

    loadContexts();
  } else {
    await storeIA.eliminarProyecto(delete_id.value);

    storeIA.triggerProjectReload();
  }

  eliminarModal.value?.cerrarModal();
};
</script>

<template>
  <div>
    <div v-if="proyecto" class="contenedor overflowYAuto">
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
                :to="`/ia/proyecto/${proyecto.id}`"
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
            :to="`/ia/proyecto/contexto/nuevo?proyecto_id=${proyecto.id}`"
          >
            Crear contexto
          </NuxtLink>
        </div>
      </div>
      <div class="grid">
        <div class="columna-16">
          <div v-if="storeIA.existeContexto">
            <div class="flex m-y-3">
              <div v-for="contexto in contextos" :key="contexto.id" class="columna-4">
                <div class="tarjeta">
                  <img
                    :src="`${config.public.geonodeUrl}/uploaded/ia/uploads/contexts/${contexto.image_type}`"
                    class="tarjeta-imagen"
                    alt="Imagen contexto"
                  />
                  <div class="tarjeta-cuerpo">
                    <p class="tarjeta-titulo">
                      {{ contexto.title }}
                    </p>
                    <UiNumeroElementos :numero="contexto.num_files" etiqueta="Fuentes" />
                  </div>
                  <div class="tarjeta-pie">
                    <nuxt-link
                      class="boton-primario boton-chico"
                      type="button"
                      :to="`/ia/chat/dinamica?context_id=${contexto.id}`"
                    >
                      Iniciar chat
                      <span class="pictograma-chat" aria-hidden="true" />
                    </nuxt-link>
                    <nuxt-link
                      class="boton-secundario boton-chico"
                      type="button"
                      :to="`/ia/proyecto/contexto/${contexto.id}?proyecto_id=${proyecto.id}`"
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
                  Para comenzar, haz clic en "Crear contexto" y selecciona las fuentes que quieres
                  usar. Esto te permitirá activar el análisis dentro del chat.
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
                  <!-- <th>Acciones</th> -->
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
                    <span class="p-x-1 p-y-minimo">{{ obtenerTipoArchivo(archivo.filename) }}</span>
                  </td>
                  <td class="p-3 flex flex-contenido-centrado">
                    <p
                      class="texto-centrado fondo-color-acento p-1 m-0 texto-color-acento borde borde-redondeado-12"
                      style="width: max-content"
                    >
                      <!-- fix: esta es cuando ya están arriba en propio -->
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
                      {{ archivo.geonode_type === 'Catalogo' ? 'Catálogo' : archivo.geonode_type }}
                    </span>
                  </td>
                  <!-- <td>
                    <button
                      class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
                      aria-label="Eliminar archivo"
                      @click="eliminarArchivo(archivo.id)"
                    >
                      <span class="pictograma-eliminar" aria-hidden="true" />
                    </button>
                  </td> -->
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
            El recurso <b class="texto-peso-600">"{{ resourceFilename }}"</b> no está público en
            geonode.
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
            ¿Deseas eliminar este {{ eliminarLabel }} de forma permanente? Una vez eliminado, se
            borrará de la memoria y no se podrá recuperar.
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
</style>
