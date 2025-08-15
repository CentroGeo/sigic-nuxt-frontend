<script setup>
import SisdaiAreaTexto from '@centrogeomx/sisdai-componentes/src/componentes/area-texto/SisdaiAreaTexto.vue';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import { useRoute } from 'vue-router';

const storeIA = useIAStore();
const route = useRoute();

// Obtener el proyecto_id de la URL
const proyectoId = ref(route.query.proyecto_id);

// Datos del formulario
const nombreContexto = ref('');
const descripcionContexto = ref('');
const portadaContexto = ref(null);
const previewImagen = ref(null);
const fileInput = ref(null);
const estaCargando = ref(false);
const mensajeError = ref('');
const mensajeExito = ref('');

const arraySources = ref([]);
const fuentesSeleccionadas = ref([]);

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
  } else {
    fuentesSeleccionadas.value.splice(index, 1);
  }
};

// Manejar cambio de archivo y generar preview
const manejarArchivo = (event) => {
  const archivo = event.target.files[0];

  mensajeError.value = null;

  // Limpiar preview anterior si existe
  if (previewImagen.value) {
    URL.revokeObjectURL(previewImagen.value);
    previewImagen.value = null;
  }

  if (archivo) {
    // Validar tipo de archivo (ej. solo imágenes)
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
    if (!tiposPermitidos.includes(archivo.type)) {
      mensajeError.value = 'Por favor, sube una imagen válida (JPEG, PNG o GIF)';
      return;
    }

    // Validar tamaño (ej. máximo 5MB)
    const tamañoMaximo = 5 * 1024 * 1024; // 5MB
    if (archivo.size > tamañoMaximo) {
      mensajeError.value = 'La imagen no debe exceder los 5MB';
      return;
    }

    portadaContexto.value = archivo;
    //mensajeError.value = "";

    // Generar URL para el preview
    previewImagen.value = URL.createObjectURL(archivo);
  }
};

const eliminarImagen = () => {
  portadaContexto.value = null;
  previewImagen.value = null;
  if (fileInput.value && fileInput.value.$el) {
    // Para componentes Sisdai, necesitamos acceder al input interno
    const input = fileInput.value.$el.querySelector('input[type="file"]');
    if (input) input.value = '';
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

    // Redirigir después de 2 segundos (opcional)
    setTimeout(() => {
      navigateTo('/ia/proyectos');
    }, 2000);
  } catch (error) {
    console.error('Error al crear contexto:', error);
    mensajeError.value = error.message || 'Ocurrió un error al crear el contexto';
  } finally {
    estaCargando.value = false;
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

  console.log(arraySources.value);

  // Limpiar selecciones al cambiar de proyecto
  fuentesSeleccionadas.value = [];

  //catalogo.value = arrayProjects;
  //catalogoFiltrado.value = arrayProjects;
};

//carga fuentes del proyecto inicialmente seleccionado
onMounted(() => {
  //console.log(proyecto.value)
  loadSources();
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
</script>

<template>
  <IaLayoutPaneles>
    <template #lista>
      <IaLayoutListas
        texto-boton="Crear proyecto"
        titulo="Proyectos"
        etiqueta-busqueda="Buscar un proyecto"
      />
    </template>

    <template #vistas-ia>
      <div class="contenedor">
        <!-- Mensajes de feedback -->
        <div v-if="mensajeError" class="mensaje-error">
          {{ mensajeError }}
        </div>
        <div v-if="mensajeExito" class="mensaje-exito">
          {{ mensajeExito }}
        </div>

        <div class="grid">
          <div class="columna-16 flex flex-contenido-separado contexto-encabezado">
            <h2>Configuración del contexto</h2>
            <NuxtLink
              class="boton boton-secundario boton-chico"
              aria-label="Regresar a proyectos"
              to="/ia/proyectos/"
            >
              Regresar a proyectos
              <span class="pictograma-flecha-izquierda" aria-hidden="true" />
            </NuxtLink>
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
                <SisdaiCampoBase
                  ref="fileInput"
                  etiqueta="Portada del proyecto"
                  tipo="file"
                  class="m-b-3"
                  accept="image/jpeg, image/png, image/gif"
                  @change="manejarArchivo"
                />
                <!-- Preview de la imagen -->
                <div v-if="previewImagen" class="preview-imagen-contenedor">
                  <h6 class="m-t-0 m-b-1">Vista previa:</h6>
                  <img
                    :src="previewImagen"
                    alt="Preview de la portada del proyecto"
                    class="preview-imagen"
                  />
                  <button
                    type="button"
                    class="boton boton-secundario boton-chico m-t-1"
                    @click="eliminarImagen"
                  >
                    Eliminar imagen
                  </button>
                </div>
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
                    <th class="checkbox-header">Selección</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="fuente in arraySources" :key="fuente.id">
                    <td class="checkbox-cell">
                      <label class="checkbox-wrapper">
                        <input
                          type="checkbox"
                          :checked="fuentesSeleccionadas.some((f) => f.id === fuente.id)"
                          @change="toggleSeleccionFuente(fuente)"
                        />
                        <span class="checkmark"></span>
                      </label>
                    </td>
                    <td>{{ fuente.filename }}</td>
                    <td>{{ fuente.document_type }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex flex-contenido-final m-b-3">
              <NuxtLink
                class="boton boton-primario boton-chico"
                aria-label="Guardar contexto"
                @click="crearContexto()"
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
      </div>
    </template>
  </IaLayoutPaneles>
</template>

<style lang="scss">
.contexto-encabezado {
  align-items: center;
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
</style>
