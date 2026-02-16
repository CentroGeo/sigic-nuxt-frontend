<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const storeIA = useIAStore();
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const idContextoSeleccionado = computed(() => route.params.idx);
const idProyectoSeleccionado = computed(() => route.params.id);
const contextoById = ref(null);

const catalogo = ref([]);
const catalogoFiltrado = ref(catalogo.value);
const campoBusqueda = ref('');

// // Datos del formulario
const nombreContexto = ref('');
const descripcionContexto = ref('');
const portadaContexto = ref(null);
const previewImagen = ref(null);
const estaCargando = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');

const arraySources = ref([]);
const fuentesSeleccionadas = ref([]);

const archivosEliminados = ref([]);

const imagenPreview = ref(null);

const loaderModal = ref(null);
const loaderTitle = ref('Guardando');
const loaderMsg = ref('Espera mientras se cargan tus archivos');

const dictCategoria = {
  datasets: 'Datos tabulados',
  documents: 'Documentos',
};

// Manejar selección/deselección de fuentes
const toggleSeleccionFuente = (fuente) => {
  const index = fuentesSeleccionadas.value.findIndex((f) => f.id === fuente.id);

  if (index === -1) {
    fuentesSeleccionadas.value.push(fuente);
    const eliminadoIndex = archivosEliminados.value.indexOf(fuente.id);

    if (eliminadoIndex !== -1) {
      archivosEliminados.value.splice(eliminadoIndex, 1);
    }
  } else {
    fuentesSeleccionadas.value.splice(index, 1);

    if (!archivosEliminados.value.includes(fuente.id)) {
      archivosEliminados.value.push(fuente.id);
    }
  }
};

// Método para editar contexto
const editarContexto = async () => {
  // Validaciones
  if (!nombreContexto.value.trim()) {
    mensajeError.value = 'El nombre del contexto es obligatorio';
    return;
  }
  if (fuentesSeleccionadas.value.length === 0) {
    mensajeError.value = 'Debes seleccionar al menos una fuente de información';
    return;
  }

  loaderModal.value?.abrirModal();

  // Preparar datos del formulario
  const formData = new FormData();
  formData.append('nombre', nombreContexto.value);
  formData.append('descripcion', descripcionContexto.value);
  // Agregar las fuentes seleccionadas como array JSON
  formData.append('fuentes', JSON.stringify(fuentesSeleccionadas.value.map((f) => f.id)));
  if (portadaContexto.value) {
    formData.append('file', portadaContexto.value);
  }
  if (archivosEliminados.value.length > 0) {
    formData.append('fuentes_elimnadas', JSON.stringify(archivosEliminados.value.map((f) => f)));
  }

  try {
    estaCargando.value = true;
    mensajeError.value = '';
    mensajeExito.value = '';

    // Llamar a la acción del store
    await storeIA.actualizarContexto(formData, idContextoSeleccionado.value);

    // Éxito
    mensajeExito.value = 'Contexto actualizado exitosamente';
    // console.log('Contexto actualizado exitosamente');

    // Navega a la vista del proyecto en cuestión
    navigateTo(`/ia/proyecto/${idProyectoSeleccionado.value}`);
  } catch (error) {
    console.error('Error al editar contexto:', error);

    mensajeError.value = error.message || 'Ocurrió un error al editar el contexto';
  } finally {
    estaCargando.value = false;

    loaderModal.value?.cerrarModal();
  }
};

// Función para cargar las fuentes del proyecto
const loadSources = async () => {
  //Consulta fuentes
  arraySources.value = await storeIA.getProjectSources(idProyectoSeleccionado.value);

  // Limpiar selecciones al cambiar de proyecto
  fuentesSeleccionadas.value = [];

  // Si el contexto ya tiene fuentes asignadas agrégalas a la lista
  if (contextoById.value?.files) {
    fuentesSeleccionadas.value = arraySources.value.filter((source) =>
      contextoById.value.files.some((file) => file.id === source.id)
    );
  }
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

async function guardarArchivo(archivo) {
  portadaContexto.value = archivo;
}

function cargarImagenDelContexto() {
  if (!contextoById.value?.context?.image_type) {
    console.error('No se encontró image_type en el contexto');
    return;
  }

  const imageUrl = `${config.public.geonodeUrl}/uploaded/ia/uploads/contexts/${contextoById.value.context.image_type}`;
  imagenPreview.value = imageUrl;
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

// Método para remover la búsqueda en el filtro de proyectos
function removerBusquedaFiltro() {
  campoBusqueda.value = '';
  catalogoFiltrado.value = catalogo.value;
}

onMounted(async () => {
  // Recuperando la lista de proyectos
  loadProjectList();

  // Recuperando nombre, descripción e imagen del contexto
  contextoById.value = await storeIA.getContextById(idContextoSeleccionado.value);
  nombreContexto.value = contextoById.value.context.title;
  descripcionContexto.value = contextoById.value.context.description;
  cargarImagenDelContexto();

  // Recuperando fuentes de información del proyecto
  await loadSources();
});

onUnmounted(() => {
  // Limpiar preview cuando el componente se desmonte
  if (previewImagen.value) {
    URL.revokeObjectURL(previewImagen.value);
  }
});
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
                    seleccionado: proyect.id === +idProyectoSeleccionado || proyect.title === '',
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
      <main id="principal" class="contenedor m-b-10 p-t-3 overflowYAuto">
        <div class="grid">
          <div class="columna-16 flex crear contexto-encabezado">
            <button
              class="boton-pictograma boton-sin-contenedor-secundario m-r-2"
              aria-label="Regresar a proyectos"
              type="button"
              @click="router.back"
            >
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento m-r-2"
                aria-hidden="true"
              />
              <span class="h5 m-0 texto-color-primario">Proyectos</span>
            </button>

            <h2>Configuración de contexto</h2>
          </div>
        </div>

        <div class="grid">
          <div class="columna-10">
            <form action="">
              <ClientOnly>
                <SisdaiCampoBase
                  v-model="nombreContexto"
                  etiqueta="Nombre del contexto"
                  ejemplo=""
                  :es_etiqueta_visible="true"
                  class="m-b-3"
                />

                <SisdaiAreaTexto
                  v-model="descripcionContexto"
                  etiqueta="Descripción del contexto (opcional)"
                  :es_etiqueta_visible="true"
                  :es_obligatorio="false"
                  class="m-b-3"
                />

                <label>Portada del contexto</label>
                <div class="m-b-2 portada-texto">
                  Sube una imagen en formato JPG o PNG (máx. 5MB).
                </div>
                <ClientOnly>
                  <IaElementoDragNdDrop
                    ref="dragNdDrop"
                    :imagen-inicial="imagenPreview"
                    @pasar-archivo="(i) => guardarArchivo(i)"
                  />
                </ClientOnly>
              </ClientOnly>
            </form>
          </div>
        </div>

        <div class="grid">
          <div class="columna-16">
            <p class="separador borde-b" />
            <h2 class="m-b-2">Selecciona fuentes de información</h2>

            <div class="m-b-2">
              Puedes seleccionar fuentes de información agregadas o subidas al proyecto, para añadir
              más fuentes de información ve a la configuración del proyecto
            </div>

            <h6 class="m-t-0 m-b-2">
              Fuentes de información disponibles en el proyecto
              <span v-if="fuentesSeleccionadas.length > 0">
                ({{ fuentesSeleccionadas.length }} seleccionadas)
              </span>
              :
            </h6>

            <div v-if="arraySources.length > 0" class="tabla-archivos m-y-3">
              <table class="tabla">
                <thead>
                  <tr>
                    <th class="checkbox-header p-x-3 p-y-2">Selección</th>
                    <th class="p-x-3 p-y-2">Nombre</th>
                    <th class="p-x-3 p-y-2">Tipo</th>
                    <th class="p-x-3 p-y-2">Categoría</th>
                    <th class="p-x-3 p-y-2">Origen</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="fuente in arraySources" :key="`fila-fuentes-${fuente.id}`">
                    <td class="checkbox-cell p-3">
                      <label :for="`checkboxfuente${fuente.id}`" class="checkbox-wrapper">
                        <input
                          :id="`checkboxfuente${fuente.id}`"
                          type="checkbox"
                          :checked="fuentesSeleccionadas.some((f) => f.id === fuente.id)"
                          @change="toggleSeleccionFuente(fuente)"
                        />
                        <span class="checkmark"></span>
                      </label>
                    </td>
                    <td class="p-3">{{ fuente.filename }}</td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">
                        {{ obtenerTipoArchivo(fuente.filename) }}
                      </span>
                    </td>
                    <td class="p-3 flex flex-contenido-centrado">
                      <p
                        class="texto-centrado fondo-color-acento p-1 m-0 texto-color-acento borde borde-redondeado-12"
                        style="width: max-content"
                      >
                        <span v-if="fuente.geonode_category === 'documents'">
                          <span class="pictograma-documento" />
                          {{ dictCategoria[fuente.geonode_category] }}
                        </span>
                        <span v-if="fuente.geonode_category === 'datasets'">
                          <span class="pictograma-tabla" />
                          {{ dictCategoria[fuente.geonode_category] }}
                        </span>
                      </p>
                    </td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">
                        {{ fuente.geonode_type === 'Catalogo' ? 'Catálogo' : fuente.geonode_type }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex flex-contenido-final m-b-10">
              <NuxtLink
                class="boton boton-primario boton-chico"
                aria-label="Guardar contexto"
                @click.prevent="editarContexto"
              >
                Guardar contexto
              </NuxtLink>

              <button
                type="button"
                class="boton boton-secundario boton-chico"
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
.overflowYAuto {
  overflow-y: auto;
  height: var(--altura-consulta-esc);
}
.crear {
  &.contexto-encabezado {
    flex-direction: column;
    align-items: flex-start;
    gap: 0px;

    .boton-regresar {
      display: flex;
      align-items: center;
      font-size: var(--Tipos-Tamao-Prrafos-Texto-alto, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: var(--Tipos-Interlineado-Prrafos-Texto-alto, 30px);
    }
  }
}

.mensaje-error {
  color: var(--color-error);
  background-color: var(--fondo-error);
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.mensaje-exito {
  color: var(--color-exito);
  background-color: var(--fondo-exito);
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.preview-imagen-contenedor {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px dashed #ccc;
  border-radius: 4px;
  text-align: center;
}

.preview-imagen {
  max-width: 100%;
  max-height: 200px;
  display: block;
  margin: 0 auto;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Asegúrate de que el input file no se vea cuando no es necesario */
input[type='file'] {
  display: block;
  margin-bottom: 1rem;
}

//tabla de archivos. TODO: estilo sisdai
/* Estilos para la tabla */
/* .tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla th, .tabla td {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
} */

/* Cabecera del checkbox */
.checkbox-header {
  width: 60px;
  text-align: center;
}

/* Celda del checkbox */
.checkbox-cell {
  vertical-align: middle;
  text-align: center;
  padding: 0 10px;
}

/* Contenedor del checkbox */
.checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

/* Checkbox personalizado */
.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  display: inline-block;
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 2px solid #ddd;
  border-radius: 3px;
  transition: all 0.2s;
}

.checkbox-wrapper:hover input ~ .checkmark {
  background-color: #f1f1f1;
}

.checkbox-wrapper input:checked ~ .checkmark {
  background-color: #2196f3;
  border-color: #2196f3;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.checkbox-wrapper input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-wrapper .checkmark:after {
  left: 5px;
  top: 1px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.portada-texto {
  font-size: var(--Tipos-Tamao-Prrafos-Prrafo-base, 16px);
  font-style: normal;
  font-weight: 600;
  line-height: var(--Tipos-Interlineado-Prrafos-Prrafos, 24px);
}
</style>
