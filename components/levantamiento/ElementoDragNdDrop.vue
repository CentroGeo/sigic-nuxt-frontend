<script setup>
const emit = defineEmits(['pasarArchivo']);

const archivos = ref([]);
const previewUrls = ref([]);
const archivoValido = ref(false);
const mensajeExito = ref('');
const imagenCargadaPorUsuario = ref(false);

const onDropZone = ref(null);

const TAMANO_MAXIMO_MB = 5;
const MAX_IMAGENES = 4;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png'];

const props = defineProps({
  imagenesIniciales: {
    type: Array,
    default: () => [],
  },
});

const tieneImagenes = computed(() => previewUrls.value.length > 0);
const llegoAlMaximo = computed(() => previewUrls.value.length >= MAX_IMAGENES);

const { files } = useDropZone(onDropZone, {
  accept: 'image/jpeg, image/png',
  multiple: true,
  onDrop,
});

async function onDrop() {
  procesarArchivos(files.value);
}

const { open, onChange } = useFileDialog({
  accept: 'image/jpeg, image/png',
  multiple: true,
});

onChange(async (selectedFiles) => {
  procesarArchivos(selectedFiles);
});

function procesarArchivos(fileList) {
  if (!fileList?.length) return;

  archivoValido.value = false;
  mensajeExito.value = '';

  const nuevosArchivos = Array.from(fileList);
  const espaciosDisponibles = MAX_IMAGENES - previewUrls.value.length;

  if (espaciosDisponibles <= 0) {
    archivoValido.value = true;
    return;
  }

  const archivosAProcesar = nuevosArchivos.slice(0, espaciosDisponibles);
  const validos = [];
  let huboError = false;

  archivosAProcesar.forEach((file) => {
    const esValido =
      TIPOS_PERMITIDOS.includes(file.type) && file.size <= TAMANO_MAXIMO_MB * 1024 * 1024;

    if (esValido) {
      validos.push(file);
    } else {
      huboError = true;
    }
  });

  if (validos.length > 0) {
    archivos.value = [...archivos.value, ...validos];
    previewUrls.value = [...previewUrls.value, ...validos.map((file) => URL.createObjectURL(file))];

    imagenCargadaPorUsuario.value = true;
    mensajeExito.value =
      validos.length === 1
        ? 'Imagen cargada correctamente'
        : `${validos.length} imágenes cargadas correctamente`;

    emit('pasarArchivo', archivos.value);
  }

  archivoValido.value = huboError;
}

function removerArchivo(index) {
  const url = previewUrls.value[index];

  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }

  previewUrls.value.splice(index, 1);

  if (index < archivos.value.length) {
    archivos.value.splice(index, 1);
  }

  if (!previewUrls.value.length) {
    mensajeExito.value = '';
    imagenCargadaPorUsuario.value = false;
  }

  archivoValido.value = false;
  emit('pasarArchivo', archivos.value);
}

function removerTodas() {
  previewUrls.value.forEach((url) => {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });

  archivos.value = [];
  previewUrls.value = [];
  archivoValido.value = false;
  mensajeExito.value = '';
  imagenCargadaPorUsuario.value = false;

  emit('pasarArchivo', []);
}

defineExpose({
  archivoValido,
});

onMounted(() => {
  if (props.imagenesIniciales?.length) {
    previewUrls.value = [...props.imagenesIniciales];
    imagenCargadaPorUsuario.value = false;
    mensajeExito.value = '';
  }
});

watch(
  () => props.imagenesIniciales,
  (nuevasImagenes) => {
    if (nuevasImagenes?.length) {
      previewUrls.value = [...nuevasImagenes];
      imagenCargadaPorUsuario.value = false;
      mensajeExito.value = '';
    } else if (!archivos.value.length) {
      previewUrls.value = [];
    }
  },
  { deep: true }
);

onBeforeUnmount(() => {
  previewUrls.value.forEach((url) => {
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
});
</script>

<template>
  <div>
    <p v-if="mensajeExito && imagenCargadaPorUsuario" class="imagen-exito p-3 m-b-2">
      <span class="texto">
        <span class="pictograma-aprobado m-r-2" aria-hidden="true" />
        {{ mensajeExito }}
      </span>
    </p>

    <p v-if="archivoValido" class="imagen-error p-3 m-b-2">
      <span class="texto m-b-1">
        <span class="pictograma-alerta m-r-2" aria-hidden="true" />
        Algunas imágenes no se cargaron
      </span>
      <span class="subtexto">
        Verifica que sean JPG o PNG, que pesen máximo 5MB y que no excedan 4 imágenes
      </span>
    </p>

    <div>
      <div ref="onDropZone" class="contenedor-dragnddrop borde borde-redondeado-16 p-1 m-b-3">
        <div v-if="tieneImagenes" class="grid-preview m-x-2 m-y-1">
          <div
            v-for="(preview, index) in previewUrls"
            :key="`${preview}-${index}`"
            class="preview-item"
          >
            <img :src="preview" :alt="`Preview ${index + 1}`" class="preview-img" />

            <button
              type="button"
              class="boton-eliminar-preview"
              aria-label="Eliminar imagen"
              @click.stop="removerArchivo(index)"
            >
              ×
            </button>
          </div>
        </div>

        <div
          v-if="!tieneImagenes"
          class="flex flex-contenido-centrado"
          style="min-height: 120px"
          @click="open()"
        >
          <div class="flex flex-vertical-centrado">
            <div class="texto-centrado m-b-1">
              <div>
                <span class="pictograma-archivo-subir pictograma-mediano" />
              </div>
              <p>Arrastra o suelta tus imágenes</p>
              <label
                class="boton boton-secundario boton-chico"
                style="cursor: pointer"
                @click.stop="open()"
              >
                Elige imágenes
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="botones-dragnddrop flex" style="gap: 8px">
        <client-only>
          <button
            v-if="tieneImagenes && !llegoAlMaximo"
            class="boton-secundario boton-chico"
            type="button"
            @click="open()"
          >
            Agregar imágenes
          </button>

          <button
            class="boton-secundario boton-chico"
            aria-label="Eliminar todas"
            type="button"
            :disabled="!tieneImagenes"
            @click="removerTodas"
          >
            Eliminar todas
          </button>
        </client-only>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.contenedor-dragnddrop {
  border-style: dashed;
  cursor: pointer;
}

.imagen-exito {
  border-radius: var(--Escalas-Bordes-redondeados-br-2, 8px);
  border: 1px solid var(--Base-Borde---borde-confirmacion, #2a6f4d);
  background: var(--Color-Confirmacin---color-confirmacion-1, #e7fbf1);

  .texto {
    display: flex;
    align-items: center;
    color: var(--Base-Tipografa---texto-confirmacion, #2a6f4d);
    font-size: 16px;
    font-weight: 500;
    line-height: 18.2px;
  }
}

.imagen-error {
  display: flex;
  flex-direction: column;
  border-radius: var(--Escalas-Bordes-redondeados-br-2, 8px);
  border: 1px solid var(--Base-Borde---borde-error, #940b1c);
  background: var(--Base-Fondo---fondo-error, #fcdade);

  .texto {
    display: flex;
    align-items: center;
    color: var(--Base-Tipografa---texto-error, #940b1c);
    font-size: 16px;
    font-weight: 500;
    line-height: 18.2px;
  }

  .subtexto {
    color: var(--Base-Tipografa---texto-error, #940b1c);
    font-size: 14px;
    font-weight: 400;
    line-height: 18.2px;
  }
}

.grid-preview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.preview-item {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.boton-eliminar-preview {
  position: absolute;
  top: 8px;
  right: 8px;

  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;

  padding: 0;
  border: none;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 16px;
  line-height: 1;

  cursor: pointer;
}
</style>
