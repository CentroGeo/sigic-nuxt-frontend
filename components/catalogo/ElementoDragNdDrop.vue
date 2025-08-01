<script setup>
/**
 * @typedef {Object} Props
 * @property {String} [tipoArchivoValidos=''] - Indica los tipos de archivo válidos.
 */

/** @type {Props} */
const props = defineProps({
  tipoArchivoValidos: {
    type: String,
    default: '',
  },
});
const { tipoArchivoValidos } = toRefs(props);

defineEmits('guardarArchivo');

const ejemplo = ref({});

const formData = ref(new FormData());

// para obtener el token para bearer
const { data } = useAuth();

const datosArriba = ref(false);
const datos = ref({});

const esSLD = ref(false);
const todosLosDemas = ref(false);
const archivoValido = ref(false);

function appendSLD(files, layerSlug, token) {
  // console.log("files", files);
  files.forEach((file) => {
    formData.value.append('base_file', file);
    formData.value.append('sld_file', file);
    formData.value.append('dataset_title', layerSlug);
    // formData.value.append("dataset_title", "geonode:coordinaciones");
    formData.value.append('style_upload_form', 'true');
    formData.value.append('permissions', JSON.stringify({}));
    formData.value.append('charset', 'undefined');
    // token importante
    formData.value.append('token', token);
  });
  // console.log("formData.value", formData.value);
}

function appendOtros(files, token) {
  // TODO: hacer append de otros
  // console.log("files", files);
  files.forEach((file) => {
    formData.value.append('base_file', file);
    formData.value.append('sld_file', file);
    // formData.value.append("dataset_title", layerSlug);
    formData.value.append('dataset_title', 'geonode:coordinaciones');
    formData.value.append('style_upload_form', 'true');
    formData.value.append('permissions', JSON.stringify({}));
    formData.value.append('charset', 'undefined');
    // token importante
    formData.value.append('token', token);
  });
  // console.log("formData.value", formData.value);
}

const validarTipoArchivo = (files) => {
  // TODO: revisar bien los MIME de los archivos válidos
  files.forEach((file) => {
    // console.log("file.name", file.name);
    // console.log("file.type", file.type);
    if (
      tipoArchivoValidos.value === 'sld' &&
      (file.name.slice(-4) === '.sld' ||
        file.name.endsWith('.sld') ||
        file.type === '.sld' ||
        file.type === 'application/vnd.sld+xml' ||
        file.type === 'application/vnd.sld+xml,.sld')
    ) {
      // console.log('Archivo SLD válido');
      esSLD.value = true;
    } else if (
      tipoArchivoValidos.value !== 'sld' &&
      (file.type === 'application/vnd.geo+json' ||
        file.type === 'application/json' ||
        file.type === 'application/geo+json' ||
        file.type === 'application/geopackage+sqlite3' ||
        file.type === 'text/csv' ||
        file.type === 'application/xml' ||
        file.type === 'application/pdf' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/png')
    ) {
      todosLosDemas.value = true;
    } else {
      archivoValido.value = true;
      datosArriba.value = false;
    }
  });
};

function appendFormData(files, token) {
  if (esSLD.value && tipoArchivoValidos.value === 'sld') {
    appendSLD(files, 'geonode:coordinaciones', token);
  } else if (todosLosDemas.value) {
    appendOtros(files, token);
  } else {
    // console.log('Archivo inválido');
  }
}

const onDropZone = ref(null);
const { files } = useDropZone(onDropZone, { onDrop });
async function onDrop() {
  // imprime el archivo que se suba mediante el drop
  // console.log("files", files.value);
  files.value = Array.from(files.value);

  if (files.value) {
    // obtén el token para el bearer
    const token = data.value?.accessToken;
    // console.log("token", token);

    datos.value = files.value;
    datosArriba.value = true;

    validarTipoArchivo(files.value);

    appendFormData(files.value, token);
  }
}

const { open, onChange } = useFileDialog();
onChange(async (files) => {
  // imprime el archivo que se suba mediante el diálogo
  // console.log("files", files);
  files = Array.from(files);

  if (files) {
    // obtén el token para el bearer
    const token = data.value?.accessToken;
    // console.log("token", token);

    datos.value = files;
    datosArriba.value = true;

    validarTipoArchivo(files);

    appendFormData(files, token);
  }
});
</script>
<template>
  <div>
    <!-- Drag & Drop -->
    <div>
      <div
        ref="onDropZone"
        class="contenedor-dragnddrop flex flex-contenido-centrado borde borde-redondeado-16 p-1 m-b-3"
        @click="open()"
      >
        <div class="flex flex-vertical-centrado">
          <div class="texto-centrado">
            <div v-if="!datosArriba">
              <div>
                <span class="pictograma-archivo-subir pictograma-mediano" />
              </div>
              <p>Arratra o suelta tu archivo</p>
            </div>
            <div class="texto-izquierda">
              <p v-for="d in datos" :key="d.name">
                {{ d.name }}
              </p>
            </div>

            <label
              class="boton boton-secundario boton-chico"
              for="identificadorCAMPOFILE"
              @click="open()"
            >
              Elige Archivo
            </label>
            <input
              id="identificadorCAMPOFILE"
              name="identificadorCAMPOFILE"
              placeholder="ejemplo"
              type="file"
              :v-model="ejemplo"
              @click="open()"
            />
          </div>
        </div>
      </div>

      <p v-if="archivoValido" class="texto-color-error">Archivo inválido</p>

      <div class="flex">
        <client-only>
          <button
            class="boton-primario boton-chico"
            aria-label="Guardar"
            type="button"
            :disabled="!datosArriba"
            @click="$emit('guardarArchivo', formData)"
          >
            Guardar
          </button>
          <button
            class="boton-secundario boton-chico"
            aria-label="Eliminar"
            type="button"
            :disabled="true"
          >
            Eliminar
          </button>
        </client-only>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.contenedor-dragnddrop {
  min-height: 281px;
  border-style: dashed;
  cursor: pointer;
}
#identificadorCAMPOFILE {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
#identificadorCAMPOFILE + label {
  display: inline-block;
  cursor: pointer;
}
#identificadorCAMPOFILE:focus + label,
#identificadorCAMPOFILE + label:hover {
}
</style>
