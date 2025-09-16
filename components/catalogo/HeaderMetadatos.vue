<script setup>
const props = defineProps({
  resource: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
  excludeLinks: {
    type: Boolean,
    default: false,
  },
});
const titleOptions = ref({
  'Metadatos básicos': { nombre: ' MetadatosBasicos', valor: 1 },
  'Ubicación y Licencias': { nombre: 'UbicacionLicencias', valor: 2 },
  'Metadatos Opcionales': { nombre: 'MetadatosOpcionales', valor: 3 },
});
const titleValue = ref();

//**Esta función lo que hace es determinar los valores de hasSLD, tabla sin geometría
// y agregar la vista de edición de Atributos del conjunto para capas vectoriales*/
function updateValues() {
  if (
    props.resource.subtype !== 'raster' &&
    isGeometricExtension(props.resource.extent) &&
    props.resource.resource_type !== 'document'
  ) {
    titleOptions.value['Atributos del Conjunto de Datos'] = {
      nombre: 'AtributosConjunto',
      valor: 4,
    };
  }
  titleValue.value = titleOptions.value[props.title]['valor'];
}

updateValues();
</script>
<template>
  <h2>{{ props.resource.title }}</h2>
  <CatalogoMenuMisArchivos
    v-if="!props.excludeLinks"
    :recurso="props.resource"
    :opciones="[
      { texto: 'Metadatos', ruta: '/catalogo/mis-archivos/editar/MetadatosBasicos' },
      {
        texto: 'Estilo',
        ruta: '/catalogo/mis-archivos/editar/estilo',
      },
      {
        texto: 'Clave Geoestadística',
        ruta: '/catalogo/mis-archivos/unir-vectores',
      },
    ]"
  />

  <h2>Metadatos</h2>
  <div style="display: flex; gap: 4px">
    <div
      v-for="option in Object.keys(titleOptions)"
      :key="`boton-${option}-${titleOptions[option]}`"
      class="borde borde-grosor-2"
      :style="{
        width: '25%',
        borderColor:
          titleValue >= titleOptions[option]['valor']
            ? 'var(--color-primario-1)'
            : 'var(--color-neutro-2)',
      }"
    ></div>
  </div>
  <ol :start="titleOptions[props.title]['valor']">
    <li>{{ props.title }}</li>
  </ol>
</template>
<style lang="scss" scoped>
.contenedor {
  background-color: pink;
}
.borde-enlace-activo {
  border-bottom: 4px solid var(--boton-primario-borde);
  border-radius: 0px;
}
</style>
