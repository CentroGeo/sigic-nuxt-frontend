<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';

const props = defineProps({
  pregunta: {
    type: Object,
    default: () => ({ pregunta: '', instrucciones: '' }),
  },
});

const emit = defineEmits(['update:pregunta']);

function actualizarCampo(campo, valor) {
  emit('update:pregunta', { ...props.pregunta, [campo]: valor });
}
</script>

<template>
  <div class="m-b-2 fondo-color-primario">
    <SisdaiCampoBase
      class="m-b-2"
      etiqueta="Pregunta abierta"
      ejemplo="Escribe una pregunta abierta"
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
  </div>
</template>
