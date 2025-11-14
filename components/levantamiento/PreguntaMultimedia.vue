<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasilla from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const props = defineProps({
  pregunta: {
    type: Object,
    default: () => ({}),
  },
  esEdicion: { type: Boolean, default: false },
  indice: { type: Number, default: 0 },
});

const imagenAporte = ref(null);

const emit = defineEmits(['update:pregunta', 'eliminar', 'mover']);

function actualizarPregunta(campo, valor) {
  emit('update:pregunta', { ...props.pregunta, [campo]: valor });
}

function eliminarPregunta() {
  emit('eliminar', props.indice);
}

function subirPregunta() {
  emit('mover', { indice: props.indice, direccion: 'arriba' });
}

function bajarPregunta() {
  emit('mover', { indice: props.indice, direccion: 'abajo' });
}

async function guardarArchivo(archivo) {
  imagenAporte.value = archivo;
}
</script>

<template>
  <div class="p-3 fondo-color-primario borde-redondeado-20 m-b-2">
    <div v-if="esEdicion">
      <div class="flex flex-contenido-separado m-b-2">
        <div
          class="borde borde-color-acento borde-redondeado-8 p-x-1 p-y-minimo fondo-color-acento texto-color-secundario"
        >
          Carga multimedia
        </div>
        <div>
          <button
            class="boton-pictograma boton-sin-contenedor-primario"
            aria-label="Subir pregunta"
            type="button"
            @click="subirPregunta"
          >
            <span class="pictograma-subir-capa" aria-hidden="true" />
          </button>
          <button
            class="boton-pictograma boton-sin-contenedor-primario"
            aria-label="Bajar pregunta"
            type="button"
            @click="bajarPregunta"
          >
            <span class="pictograma-bajar-capa" aria-hidden="true" />
          </button>
        </div>
      </div>
      <SisdaiSelector
        class="m-b-2"
        etiqueta="Tipo de multimedia"
        :model-value="props.pregunta.tipoMultimedia"
        @update:model-value="(valor) => actualizarPregunta('tipoMultimedia', valor)"
      >
        <option value="imagen">Imagen</option>
        <option value="video">Video</option>
      </SisdaiSelector>
      <SisdaiCampoBase
        class="m-b-2"
        etiqueta="Instrucciones"
        ejemplo="Escribe las instrucciones"
        :es_etiqueta_visible="true"
        :model-value="props.pregunta.instrucciones"
        @update:model-value="(valor) => actualizarPregunta('instrucciones', valor)"
      />
      <div class="flex">
        <SisdaiCasilla
          etiqueta="Obligatorio"
          :model-value="props.pregunta.obligatorio"
          @update:model-value="(valor) => actualizarPregunta('obligatorio', valor)"
        />
        <button
          class="boton-secundario boton-chico"
          aria-label="Eliminar pregunta"
          @click="eliminarPregunta"
        >
          Eliminar pregunta <span class="pictograma-eliminar"></span>
        </button>
      </div>
    </div>
    <div v-else>
      <div class="m-b-2 texto-peso-500">{{ props.indice + 1 }}. {{ props.pregunta.pregunta }}</div>
      <IaElementoDragNdDrop
        ref="dragNdDrop"
        class="m-b-2"
        :imagen-inicial="imagenPreview"
        @pasar-archivo="(i) => guardarArchivo(i)"
      />
      <div v-if="props.pregunta.obligatorio">Obligatoria*</div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
