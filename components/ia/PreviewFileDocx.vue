<script setup>
import VueOfficeDocx from '@vue-office/docx';
/**
 * @typedef {Object} Props
 * @property {String} [docx=''] - Indica la url del documento
 */
/** @type {Props} */
const props = defineProps({
  docx: {
    type: String,
    default: '',
  },
});
console.log('VueOfficeDocx', VueOfficeDocx);
const { docx } = toRefs(props);
const loading = ref(true);

function renderedHandler() {
  loading.value = false;
  console.log('Rendering complete');
}
function errorHandler() {
  loading.value = false;
  console.log('Rendering failure');
}
</script>
<template>
  <client-only>
    <vue-office-docx
      :src="docx"
      style="width: 100%; height: 100%; border: none; border-radius: 8px"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
  </client-only>
</template>
