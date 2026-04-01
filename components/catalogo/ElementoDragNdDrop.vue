<script setup>
import { convertirBytes } from '~/utils/catalogo';
// emit para pasar los archivos al componente padre
const emit = defineEmits(['pasarArchivo']);

const archivos = ref({});
const archivosArriba = ref(false);
const archivoValido = ref(false);

const onDropZone = ref(null);
const { files } = useDropZone(onDropZone, { onDrop });
async function onDrop() {
  archivos.value = files.value;
  archivosArriba.value = true;
}

const { open, onChange } = useFileDialog();
onChange(async (files) => {
  archivos.value = files;
  archivosArriba.value = true;
});

const removerArchivos = () => {
  archivos.value = {};
  archivosArriba.value = false;
  archivoValido.value = false;
};

const archivoNoValido = () => {
  archivoValido.value = true;
};

function deleteFile(file) {
  const newFiles = new DataTransfer();
  const arrayFiles = Array.from(archivos.value);
  const newArray = arrayFiles.filter((d) => d.name !== file.name);
  newArray.forEach((d) => newFiles.items.add(d));
  archivos.value = newFiles.files;
  if (archivos.value.length === 0) {
    archivosArriba.value = false;
    archivoValido.value = false;
  }
}

defineExpose({
  archivoValido,
  archivoNoValido,
});
</script>
<template>
  <div>
    <!-- Drag & Drop -->
    <div>
      <div
        ref="onDropZone"
        class="contenedor-dragnddrop borde borde-redondeado-16 p-1 m-b-3"
        @click="open()"
      >
        <div
          v-if="archivosArriba"
          class="m-x-2 m-y-1"
          style="max-height: 184px; overflow-y: scroll"
        >
          <div v-for="archivo in archivos" :key="archivo.name" class="flex flex-contenido-separado">
            <p class="nombre-archivo flex flex-vertical-centrado m-y-1 columna-9">
              {{ archivo.name }}
            </p>

            <div class="flex">
              <p
                class="flex flex-vertical-centrado fondo-color-neutro borde borde-redondeado-8 m-y-1"
                style="padding: 4px"
              >
                .{{ archivo.name.split('.')[1] }}
              </p>
              <p class="flex flex-vertical-centrado m-y-1">{{ convertirBytes(archivo.size) }}</p>
              <button
                class="boton-pictograma boton-sin-contenedor-secundario boton-chico"
                @click.stop="deleteFile(archivo)"
              >
                <span class="pictograma-cerrar"></span>
              </button>
            </div>
          </div>
        </div>
        <div
          class="flex flex-contenido-centrado"
          :style="`min-height: ${!archivosArriba ? '281px' : '0px; margin-top: 32px;'}`"
        >
          <div class="flex flex-vertical-centrado">
            <div class="texto-centrado m-b-1">
              <div v-if="!archivosArriba">
                <div>
                  <span class="pictograma-archivo-subir pictograma-mediano" />
                </div>
                <p>Arrastra o suelta tu archivo</p>
              </div>

              <label class="boton boton-secundario boton-chico" @click.stop="open()">
                Elige Archivo
              </label>
            </div>
          </div>
        </div>
      </div>

      <p v-if="archivoValido" class="texto-color-error">Archivo inválido</p>

      <div class="botones-dragnddrop flex">
        <client-only>
          <button
            class="boton-primario boton-chico"
            aria-label="Guardar"
            type="button"
            :disabled="!archivosArriba"
            @click="emit('pasarArchivo', archivos)"
          >
            Guardar
          </button>
          <button
            class="boton-secundario boton-chico"
            aria-label="Eliminar"
            type="button"
            :disabled="!archivosArriba"
            @click="removerArchivos"
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
  height: 300px;
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

.nombre-archivo {
  overflow-wrap: break-word;
  white-space: normal;
}
</style>
