<script setup>
import { computed } from "vue";
const identificador = idAleatorio();
function idAleatorio() {
  return "campo-" + Math.random().toString(36).substring(2);
}
defineExpose({
  identificador,
});
const props = defineProps({
  etiqueta: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    default: "text",
  },
  ejemplo: {
    type: String,
    default: "",
  },
  textoAyuda: {
    type: String,
    default: "",
  },
  textoError: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String, Number],
    default: "",
  },
  esEtiquetaVisible: {
    type: Boolean,
    default: true,
  },
  esObligatorio: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue"]);
const modeloCampo = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});
</script>
<template>
  <div>
    <label
      :for="identificador"
      :class="es_etiqueta_visible ? '' : 'a11y-solo-lectura'"
    >
      {{ etiqueta }}
      <span v-if="es_obligatorio" class="formulario-obligatoriedad">
        (Obligatorio)
      </span>
    </label>
    <input
      :id="identificador"
      v-model="modeloCampo"
      :name="identificador"
      :placeholder="ejemplo"
      :required="es_obligatorio"
      :aria-required="es_obligatorio"
      :type="tipo"
      v-bind="$attrs"
    />
    <p
      v-if="textoAyuda || esObligatorio || textoError"
      aria-live="polite"
      class="formulario-ayuda"
      role="status"
    >
      {{ textoError }}
      {{ textoAyuda }}
    </p>
  </div>
</template>
