<script setup>
import VueOfficeExcel from '@vue-office/excel';
/**
 * @typedef {Object} Props
 * @property {String} [excel=''] - Indica la url del documento
 */
/** @type {Props} */
const props = defineProps({
  excel: {
    type: String,
    default: '',
  },
});
console.log('VueOfficeExcel', VueOfficeExcel);
const { excel } = toRefs(props);
const loading = ref(true);
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
  console.log('Rendering complete');
}
function errorHandler() {
  loading.value = false;
  console.log('Rendering failure');
}
</script>
<template>
  <client-only>
    <vue-office-excel
      :src="excel"
      :options="options"
      style="width: 100%; height: 100%; border: none; border-radius: 8px"
      @rendered="renderedHandler"
      @error="errorHandler"
    />
  </client-only>
</template>
