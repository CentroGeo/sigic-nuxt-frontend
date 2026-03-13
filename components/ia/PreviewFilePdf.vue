<script setup>
import VueOfficePdf from '@vue-office/pdf';
/**
 * @typedef {Object} Props
 * @property {String} [pdf=''] - Indica la url del documento
 */
/** @type {Props} */
const props = defineProps({
  pdf: {
    type: String,
    default: '',
  },
});
console.log('VueOfficePdf', VueOfficePdf);
const { pdf } = toRefs(props);
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
    <vue-office-pdf
      :src="pdf"
      style="width: 100%; height: 100%; border: none; border-radius: 8px"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
  </client-only>
</template>
