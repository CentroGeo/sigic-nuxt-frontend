<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

const props = defineProps({
  pregunta: {
    type: Object,
    default: () => ({ pregunta: '', instrucciones: '', opciones: [] }),
  },
  indice: { type: Number, default: 0 },
});

const emit = defineEmits(['update:pregunta']);

function actualizarCampo(campo, valor) {
  emit('update:pregunta', { ...props.pregunta, [campo]: valor });
}

function agregarOpcion() {
  const nuevasOpciones = [...props.pregunta.opciones, ''];
  emit('update:pregunta', { ...props.pregunta, opciones: nuevasOpciones });
}

function actualizarOpcion(index, valor) {
  const nuevasOpciones = [...props.pregunta.opciones];
  nuevasOpciones[index] = valor;
  emit('update:pregunta', { ...props.pregunta, opciones: nuevasOpciones });
}

function eliminarOpcion(index) {
  const nuevasOpciones = [...props.pregunta.opciones];
  nuevasOpciones.splice(index, 1);
  emit('update:pregunta', { ...props.pregunta, opciones: nuevasOpciones });
}
</script>

<template>
  <div class="m-b-2 fondo-color-primario">
    <SisdaiCampoBase
      class="m-b-2"
      etiqueta="Pregunta de opción"
      ejemplo="Escribe una pregunta de opción"
      :es_etiqueta_visible="true"
      :model-value="pregunta.pregunta"
      @update:model-value="(valor) => actualizarCampo('pregunta', valor)"
    />

    <SisdaiCampoBase
      etiqueta="Instrucciones"
      ejemplo="Escribe las instrucciones para la persona participante"
      :es_etiqueta_visible="true"
      :model-value="pregunta.instrucciones"
      @update:model-value="(valor) => actualizarCampo('instrucciones', valor)"
    />
    <p class="borde-b borde-color-secundario" />
    <div class="flex m-b-2">
      <span class="texto-color-secundario">Opciones</span>
      <button
        class="boton-primario boton-chico boton-pictograma"
        aria-label="Agregar opcion"
        type="button"
        @click="agregarOpcion"
      >
        <span class="pictograma-agregar" aria-hidden="true" />
      </button>
    </div>
    <div
      v-for="(opcion, index) in pregunta.opciones"
      :key="index"
      class="flex flex-contenido-separado m-b-1"
    >
      <SisdaiCampoBase
        class="input-opcion"
        :etiqueta="`Opción ${index + 1}`"
        ejemplo="Escribe la opción"
        :es_etiqueta_visible="true"
        :model-value="opcion"
        @update:model-value="(valor) => actualizarOpcion(index, valor)"
      />
      <button
        class="boton-secundario boton-grande boton-pictograma boton-eliminar-opcion"
        @click="eliminarOpcion(index)"
      >
        <span class="pictograma-cerrar" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-opcion {
  flex: 1;
}

.boton-eliminar-opcion {
  align-self: flex-end;
}
</style>
