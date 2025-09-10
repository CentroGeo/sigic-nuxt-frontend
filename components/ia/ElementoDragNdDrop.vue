<script setup>
const emit = defineEmits(['pasarArchivo']);

const archivo = ref(null);
const previewUrl = ref(null);
const archivosArriba = ref(false);
const archivoValido = ref(false);

const onDropZone = ref(null);

const TAMANO_MAXIMO_MB = 5;
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png'];
const mensajeExito = ref('');

const imagenCargadaPorUsuario = ref(false);

const { files } = useDropZone(onDropZone, {
  accept: 'image/jpeg, image/png',
  multiple: false,
  onDrop,
});

async function onDrop() {
  const file = files.value?.[0];
  validarArchivo(file);
}

const { open, onChange } = useFileDialog({
  accept: 'image/jpeg, image/png',
  multiple: false,
});

onChange(async (selectedFiles) => {
  const file = selectedFiles?.[0];
  validarArchivo(file);
});

function validarArchivo(file) {
  if (file && TIPOS_PERMITIDOS.includes(file.type) && file.size <= TAMANO_MAXIMO_MB * 1024 * 1024) {
    archivo.value = file;
    previewUrl.value = URL.createObjectURL(file);
    archivosArriba.value = true;
    archivoValido.value = false;
    imagenCargadaPorUsuario.value = true;
    mensajeExito.value = 'Imagen cargada correctamente';
    emit('pasarArchivo', file);
  } else {
    archivo.value = null;
    previewUrl.value = null;
    archivosArriba.value = false;
    archivoValido.value = true;
    mensajeExito.value = '';
    imagenCargadaPorUsuario.value = false;
  }
}

const removerArchivo = () => {
  archivo.value = null;
  previewUrl.value = null;
  archivosArriba.value = false;
  archivoValido.value = false;
  mensajeExito.value = '';
};

defineExpose({
  archivoValido,
});

const props = defineProps({
  imagenInicial: {
    type: String,
    default: null,
  },
});

onMounted(() => {
  if (props.imagenInicial) {
    previewUrl.value = props.imagenInicial;
    archivosArriba.value = true;
    imagenCargadaPorUsuario.value = false;
    mensajeExito.value = '';
  }
});

watch(
  () => props.imagenInicial,
  (nuevaImagen) => {
    if (nuevaImagen) {
      previewUrl.value = nuevaImagen;
      archivosArriba.value = true;
      imagenCargadaPorUsuario.value = false;
      mensajeExito.value = '';
    }
  }
);
</script>

<template>
  <div>
    <!-- Mensaje de éxito -->
    <p v-if="mensajeExito && imagenCargadaPorUsuario" class="imagen-exito p-3 m-b-2">
      <span class="texto">
        <span class="pictograma-aprobado m-r-2" aria-hidden="true" />
        {{ mensajeExito }}
      </span>
    </p>

    <!-- Mensaje de error -->
    <p v-if="archivoValido" class="imagen-error p-3 m-b-2">
      <span class="texto m-b-1"
        ><span class="pictograma-alerta m-r-2" aria-hidden="true" />La imagen no se cargó</span
      >
      <span class="subtexto">La imagen excede los 5MB o no está en formato JPG o PNG</span>
    </p>

    <div>
      <div
        ref="onDropZone"
        class="contenedor-dragnddrop borde borde-redondeado-16 p-1 m-b-3"
        :class="{ deshabilitado: archivosArriba }"
        @click="!archivosArriba && open()"
      >
        <!-- Preview de imagen -->
        <div
          v-if="archivosArriba && previewUrl"
          class="m-x-2 m-y-1 flex flex-contenido-centrado"
          style="max-height: 200px; overflow: hidden"
        >
          <img
            :src="previewUrl"
            alt="Preview"
            style="max-width: 100%; max-height: 200px; object-fit: contain"
          />
        </div>

        <!-- Zona de drop o mensaje cuando no hay imagen -->
        <div
          class="flex flex-contenido-centrado"
          :style="`min-height: ${!archivosArriba ? '120px' : '0px; margin-top: 32px;'}`"
        >
          <div class="flex flex-vertical-centrado">
            <div v-if="!archivosArriba" class="texto-centrado m-b-1">
              <div>
                <span class="pictograma-archivo-subir pictograma-mediano" />
              </div>
              <p>Arrastra o suelta tu imagen</p>
              <label
                class="boton boton-secundario boton-chico"
                style="cursor: pointer"
                @click.stop="open()"
              >
                Elige imagen
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón Eliminar -->
      <div class="botones-dragnddrop flex">
        <client-only>
          <button
            class="boton-secundario boton-chico"
            aria-label="Eliminar"
            type="button"
            :disabled="!archivosArriba"
            @click="removerArchivo"
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
  border-style: dashed;
  cursor: pointer;
}

.deshabilitado {
  pointer-events: none;
  cursor: default;
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
    font-style: normal;
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
    font-style: normal;
    font-weight: 500;
    line-height: 18.2px;
  }

  .subtexto {
    color: var(--Base-Tipografa---texto-error, #940b1c);
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 18.2px;
  }
}
</style>
