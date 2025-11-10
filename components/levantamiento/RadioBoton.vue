<script setup>
defineProps({
  name: {
    type: String,
  },
  value: {
    type: String,
  },
  label: {
    type: String,
  },
  modelValue: { type: String },
  description: {
    type: String,
  },
});

const emit = defineEmits(['update:modelValue']);

function generaIdAleatorio() {
  return 'id-' + Math.random().toString(36).substring(2);
}
const idAleatorio = generaIdAleatorio();
</script>

<template>
  <div
    class="flex radio-container sin-hover p-x-3 p-y-2 fondo-color-neutro"
    @click="emit('update:modelValue', value)"
  >
    <input
      :id="`${idAleatorio}-radio`"
      type="radio"
      :name="name"
      :value="value"
      :label="label"
      :checked="modelValue === value"
    />
    <label :for="`${idAleatorio}-radio`">
      {{ label }}
    </label>
    <span class="m-t-minimo">{{ description }}</span>
  </div>
</template>

<style lang="scss" scoped>
.radio-container {
  flex: 1;
  flex-direction: column;
  gap: 0;
  border-radius: 20px;
  cursor: pointer;

  &.sin-hover {
    input[type='radio']:not(:disabled):hover + label {
      background-color: transparent !important;
      border-color: transparent !important;
    }

    input[type='radio']:not(:disabled):focus + label {
      background-color: transparent !important;
      border-color: transparent !important;
      box-shadow: none;
    }
  }
}
</style>
