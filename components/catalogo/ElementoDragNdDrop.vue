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
const datosArriba = ref(false);
const datos = ref([]);
const ejemplo = ref();
const archivoValido = false;

// emit para pasar los archivos al componente padre
const emit = defineEmits(['pasarArchivo']);
const archivos = ref();

const onDropZone = ref(null);
const { files } = useDropZone(onDropZone, { onDrop });
async function onDrop() {
  // imprime el archivo que se suba mediante el drop
  console.log('files', files.value);
  archivos.value = files.value;
  // files.value = Array.from(files.value);
}

const { open, onChange } = useFileDialog();
onChange(async (files) => {
  // imprime el archivo que se suba mediante el diálogo
  console.log('files', files);
  archivos.value = files;
  // const files = Array.from(files);
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
            :disabled="false"
            @click="emit('pasarArchivo', archivos)"
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
