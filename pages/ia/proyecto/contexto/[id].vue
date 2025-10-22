<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { useRoute, useRouter } from 'vue-router';

const storeIA = useIAStore();
const route = useRoute();
const router = useRouter();

// Obtener el proyecto_id de la URL
const proyectoId = ref(route.query.proyecto_id);

// Datos del formulario
const nombreContexto = ref('');
const descripcionContexto = ref('');
const portadaContexto = ref(null);
const previewImagen = ref(null);
/* const fileInput = ref(null); */
const estaCargando = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');

const arraySources = ref([]);
const fuentesSeleccionadas = ref([]);

const esEdicion = ref(false);
const contexto = ref(null);

const archivosEliminados = ref([]);

const config = useRuntimeConfig();
const imagenPreview = ref(null);

const loaderModal = ref(null);
const loaderTitle = ref('Guardando');
const loaderMsg = ref('Espere un momento');

// Si necesitas reaccionar a cambios en el parámetro
watch(
  () => route.query.proyecto_id,
  (newId) => {
    proyectoId.value = newId;
    // Aquí puedes hacer algo cuando cambie el ID
    loadSources();
  }
);

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

// Limpiar preview cuando el componente se desmonte
onUnmounted(() => {
  if (previewImagen.value) {
    URL.revokeObjectURL(previewImagen.value);
  }
});

// Usar el ID en la creación del contexto
const crearContexto = async () => {
  console.log(proyectoId);
  // Validaciones
  if (!proyectoId.value) {
    mensajeError.value = 'No se proporcionó proyecto_id';
    return;
  }

  if (!nombreContexto.value.trim()) {
    mensajeError.value = 'El nombre del contexto es obligatorio';
    return;
  }

  if (fuentesSeleccionadas.value.length === 0) {
    mensajeError.value = 'Debes seleccionar al menos una fuente de información';
    return;
  }

  loaderModal.value?.abrirModal();

  console.log('proyecto:' + proyectoId.value);
  console.log(portadaContexto);

  // Preparar datos del formulario
  const formData = new FormData();
  formData.append('proyecto_id', proyectoId.value);
  formData.append('nombre', nombreContexto.value);
  formData.append('descripcion', descripcionContexto.value);

  // Agregar las fuentes seleccionadas como array JSON
  formData.append('fuentes', JSON.stringify(fuentesSeleccionadas.value.map((f) => f.id)));

  if (portadaContexto.value) {
    formData.append('file', portadaContexto.value);
  }

  try {
    estaCargando.value = true;
    mensajeError.value = '';
    mensajeExito.value = '';

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // Llamar a la acción del store
    await storeIA.crearContexto(formData);

    // Éxito
    mensajeExito.value = 'Contexto creado exitosamente';
    console.log('Contexto creado exitosamente');

    navigateTo('/ia/proyectos');
  } catch (error) {
    console.error('Error al crear contexto:', error);
    mensajeError.value = error.message || 'Ocurrió un error al crear el contexto';
  } finally {
    estaCargando.value = false;

    loaderModal.value?.cerrarModal();
  }

  //storeIA.crearContexto(proyectoId.value);
  // ... resto de tu lógica

  //to="/ia/proyectos"
};

// Función para cargar las fuentesl proyecto
const loadSources = async () => {
  //arraySources = [];

  //Consulta fuentes
  console.log(proyectoId.value);
  arraySources.value = await storeIA.getProjectSources(proyectoId.value);

  // console.log(arraySources.value);

  // Limpiar selecciones al cambiar de proyecto
  fuentesSeleccionadas.value = [];

  //catalogo.value = arrayProjects;
  //catalogoFiltrado.value = arrayProjects;

  if (contexto.value?.files) {
    fuentesSeleccionadas.value = arraySources.value.filter((source) =>
      contexto.value.files.some((file) => file.id === source.id)
    );
  }
};

const editarContexto = async () => {
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
    formData.append('fuentes_elimnadas', archivosEliminados);
  }

  try {
    estaCargando.value = true;
    mensajeError.value = '';
    mensajeExito.value = '';

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    await storeIA.actualizarContexto(formData, route.params.id);

    mensajeExito.value = 'Contexto actualizado exitosamente';
    console.log('Contexto actualizado exitosamente');

    navigateTo('/ia/proyectos');
  } catch (error) {
    console.error('Error al editar contexto:', error);
    mensajeError.value = error.message || 'Ocurrió un error al editar el contexto';
  } finally {
    estaCargando.value = false;
    loaderModal.value?.cerrarModal();
  }
};

//carga fuentes del proyecto inicialmente seleccionado
onMounted(async () => {
  if (route.params.id !== 'nuevo') {
    esEdicion.value = true;
    contexto.value = await storeIA.getContextById(route.params.id);
    console.log(contexto.value);

    nombreContexto.value = contexto.value.context.title;
    descripcionContexto.value = contexto.value.context.description;

    cargarImagenDelContexto();
  }
  //console.log(proyecto.value)
  await loadSources();
});

watch(
  proyectoId,
  (nuevo) => {
    if (nuevo?.id) {
      loadSources();
    }
  },
  { immediate: true }
); // Esto lo ejecuta también en el primer render

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

function irAProyectos() {
  router.push('/ia/proyectos/');
}

function cargarImagenDelContexto() {
  if (!contexto.value?.context?.image_type) {
    console.error('No se encontró image_type en el contexto');
    return;
  }

  const imageUrl = `${config.public.geonodeUrl}/uploaded/ia/uploads/contexts/${contexto.value.context.image_type}`;
  imagenPreview.value = imageUrl;
}

onBeforeUnmount(() => {
  if (imagenPreview.value) {
    URL.revokeObjectURL(imagenPreview.value);
  }
});
</script>

<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <IaLayoutListas
        texto-boton="Nuevo proyecto"
        titulo="Proyectos"
        etiqueta-busqueda="Buscar un proyecto"
      />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 p-t-3 overflowYAuto">
        <!-- Mensajes de feedback -->
        <!-- <div v-if="mensajeError" class="mensaje-error">
          {{ mensajeError }}
        </div>
        <div v-if="mensajeExito" class="mensaje-exito">
          {{ mensajeExito }}
        </div> -->

        <div class="grid">
          <div class="columna-16 flex crear contexto-encabezado">
            <div class="boton-regresar">
              <button
                class="boton-pictograma boton-sin-contenedor-secundario m-r-2"
                aria-label="Regresar a proyectos"
                type="button"
                @click="irAProyectos"
              >
                <span class="pictograma-flecha-izquierda" aria-hidden="true" />
              </button>
              Proyectos
            </div>

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
                <!-- <SisdaiCampoBase
                  ref="fileInput"
                  etiqueta="Portada del proyecto"
                  tipo="file"
                  class="m-b-3"
                  accept="image/jpeg, image/png, image/gif"
                  texto_ayuda="Sube una imagen en formato JPG o PNG (máx. 5MB)."
                  @change="manejarArchivo"
                /> -->
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
        <!--<div class="flex flex-contenido-final">
          <NuxtLink
            class="boton boton-primario boton-chico"
            aria-label="Guardar contexto"
            @click="crearContexto()"
          >
            Guardar contexto
          </NuxtLink>
          <button class="boton-chico boton-secundario" aria-label="Cancelar">
            Cancelar
          </button>
        </div>-->
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
                  <tr v-for="fuente in arraySources" :key="fuente.id">
                    <td class="checkbox-cell p-3">
                      <label class="checkbox-wrapper">
                        <input
                          type="checkbox"
                          :checked="fuentesSeleccionadas.some((f) => f.id === fuente.id)"
                          @change="toggleSeleccionFuente(fuente)"
                        />
                        <span class="checkmark"></span>
                      </label>
                    </td>
                    <td class="p-3">{{ fuente.filename }}</td>
                    <td class="p-3 etiqueta-tabla">
                      <span class="p-x-1 p-y-minimo">{{
                        obtenerTipoArchivo(fuente.filename)
                      }}</span>
                    </td>
                    <td class="p-3 flex flex-contenido-centrado">
                      <p
                        class="texto-centrado fondo-color-acento p-1 m-0 texto-color-acento borde borde-redondeado-12"
                        style="width: max-content"
                      >
                        <span v-if="fuente.geonode_category === 'Documento'">
                          <span class="pictograma-documento" />{{ fuente.geonode_category }}
                        </span>

                        <span v-if="fuente.geonode_category === 'Tabla'">
                          <span class="pictograma-tabla" />{{ fuente.geonode_category }}
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
                @click.prevent="esEdicion ? editarContexto() : crearContexto()"
              >
                Guardar contexto
              </NuxtLink>
              <NuxtLink
                class="boton boton-secundario boton-chico"
                aria-label="Cancelar"
                to="/ia/proyectos/"
              >
                Cancelar
              </NuxtLink>
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
