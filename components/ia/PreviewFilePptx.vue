<script setup>
import VueOfficePptx from '@vue-office/pptx';
/**
 * @typedef {Object} Props
 * @property {String} [ppxt=''] - Indica la url del documento
 */
/** @type {Props} */
const props = defineProps({
  pptx: {
    type: String,
    default: '',
  },
});
console.log('VueOfficePptx', VueOfficePptx);
const { pptx } = toRefs(props);
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
    <vue-office-pptx
      :src="pptx"
      style="width: 100%; height: 100%; border: none; border-radius: 8px"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
  </client-only>
</template>
