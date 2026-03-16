<script setup>
import VueOfficeDocx from '@vue-office/docx';
import VueOfficeExcel from '@vue-office/excel';
import VueOfficePdf from '@vue-office/pdf';
import VueOfficePptx from '@vue-office/pptx';
/**
 * @typedef {Object} Props
 * @property {String} [src=''] - Indica la url del documento
 */
/** @type {Props} */
const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  fileFormat: {
    type: String,
    default: '',
  },
});
// console.log('VueOfficeDocx', VueOfficeDocx);
// console.log('VueOfficePptx', VueOfficePptx);
// console.log('VueOfficeExcel', VueOfficeExcel);
// console.log('VueOfficePdf', VueOfficePdf);

const { src, fileFormat } = toRefs(props);
const loading = ref(true);
// opciones para excel
const options = ref({
  xls: false, // preview xlsx file set to false; preview xls file set to true
  minColLength: 0, // how many columns render at least excel, if you want to implement the xlsx file content, you can render a few columns, you can set this value to 0.
  minRowLength: 0, // how many lines render at least excel, if you want to implement the render based on the actual function of xlsx, you can set this value to 0.
  widthOffset: 10, // if the rendered result feels that the cell width is not enough, you can add Npx width to the default list width
  heightOffset: 10, // Add Npx height to the default list height of the rendered
  beforeTransformData: (workbookData) => {
    return workbookData;
  }, // the underlying Excel file content is obtained through exceljs, through this hook function, you can modify the obtained excel file content, such as a cell data display is incorrect, you can modify the value value of each cell here.
  transformData: (workbookData) => {
    return workbookData;
  }, // after processing the obtained excel data and renders to the page, the data and style that will be rendered can be modified by transformData, at which point the text value of each cell is the content that is about to be rendered on the page
});

function renderedHandler() {
  loading.value = false;
  console.warn('Rendering complete');
}
function errorHandler() {
  loading.value = false;
  console.error('Rendering failure');
}
</script>
<template>
  <client-only>
    <div v-if="loading" class="flex flex-contenido-centrado">
      <figure>
        <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
        <figcaption class="texto-centrado">Cargando previsualización</figcaption>
      </figure>
    </div>
    <vue-office-docx
      v-if="fileFormat === 'word'"
      :src="src"
      class="archivo-previs"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
    <vue-office-pptx
      v-if="fileFormat === 'pptx'"
      :src="src"
      class="archivo-previs"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
    <vue-office-excel
      v-if="fileFormat === 'csv'"
      :src="src"
      :options="options"
      class="archivo-previs"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
    <vue-office-pdf
      v-if="fileFormat === 'pdf'"
      :src="src"
      class="archivo-previs"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
  </client-only>
</template>

<style lang="scss" scoped>
.archivo-previs {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}
</style>
