<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  pk: {
    type: String,
    default: '',
  },
  tipo: {
    type: String,
    default: '',
  },
  resource: {
    type: Object,
    default: () => ({}),
  },
});
const rutas = ref({});
const lastButton = ref('');
const rutasConAtributos = {
  MetadatosBasicos: { siguiente: 'UbicacionLicencias', anterior: undefined },
  UbicacionLicencias: { siguiente: 'MetadatosOpcionales', anterior: 'MetadatosBasicos' },
  MetadatosOpcionales: { siguiente: 'AtributosConjunto', anterior: 'UbicacionLicencias' },
  AtributosConjunto: { siguiente: undefined, anterior: 'MetadatosOpcionales' },
};
const rutasSinAtributos = {
  MetadatosBasicos: { siguiente: 'UbicacionLicencias', anterior: undefined },
  UbicacionLicencias: { siguiente: 'MetadatosOpcionales', anterior: 'MetadatosBasicos' },
  MetadatosOpcionales: { siguiente: undefined, anterior: 'UbicacionLicencias' },
};
if (props.resource.subtype === 'vector' && props.resource.resource_type === 'dataset') {
  rutas.value = rutasConAtributos;
  lastButton.value = 'AtributosConjunto';
} else {
  rutas.value = rutasSinAtributos;
  lastButton.value = 'MetadatosOpcionales';
}
function irARutaConQuery() {
  navigateTo({
    path: `/catalogo/mis-archivos/editar/${rutas.value[props.title]['siguiente']}`,
    query: { data: props.pk, type: props.tipo },
  });
}
</script>
<template>
  <div class="flex p-t-3">
    <nuxt-link class="boton-secundario boton-chico" type="button" to="/catalogo/mis-archivos"
      >Ir a mis archivos</nuxt-link
    >
    <button class="boton-primario boton-chico" :disabled="false">Actualizar</button>
    <button
      class="boton-primario boton-chico"
      :disabled="title === lastButton ? true : false"
      @click="irARutaConQuery"
    >
      Siguiente
    </button>
  </div>
</template>
