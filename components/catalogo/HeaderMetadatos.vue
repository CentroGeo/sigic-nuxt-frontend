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
});
const route = useRoute();
const titleOptions = {
  'Metadatos básicos': { nombre: ' MetadatosBasicos', valor: 1 },
  'Ubicación y Licencias': { nombre: 'UbicacionLicencias', valor: 2 },
  'Metadatos Opcionales': { nombre: 'MetadatosOpcionales', valor: 3 },
  'Atributos del Conjunto de Datos': { nombre: 'AtributosConjunto', valor: 4 },
};
const titleValue = computed(() => titleOptions[props.title]['valor']);
const tablaSinGeometria = ref(false);

function tieneEstilo() {
  if (props.resource.resource_type === 'document') {
    return false;
  } else {
    if (props.resource.resource_type === 'dataset') {
      if (!isGeometricExtension(props.resource.extent)) {
        tablaSinGeometria.value = true;
      }
    }
    return isGeometricExtension(props.resource.extent) ? true : false;
  }
}

const bordeEnlaceActivo = (ruta) => {
  if (route.path === ruta) {
    return 'borde-enlace-activo';
  }
  return '';
};
</script>
<template>
  <h2>{{ props.resource.title }}</h2>

  <div class="flex">
    <nuxt-link
      :class="
        bordeEnlaceActivo(`/catalogo/mis-archivos/editar/${titleOptions[props.title]['nombre']}`)
      "
      >Metadatos
    </nuxt-link>
    <nuxt-link
      v-if="tieneEstilo()"
      :class="bordeEnlaceActivo('/catalogo/mis-archivos/editar/estilo')"
      >Estilo
    </nuxt-link>
    <nuxt-link
      v-if="tablaSinGeometria"
      :class="bordeEnlaceActivo('/catalogo/mis-archivos/unir-vectores')"
      >Clave Geoestadística
    </nuxt-link>
  </div>
  <div class="borde-b borde-color-secundario"></div>

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
    <!--     <div
      class="borde borde-grosor-2"
      style="width: 25%; border-color: var(--color-primario-1)"
    ></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div> -->
  </div>
  <ol>
    <li>{{ props.title }}</li>
  </ol>
</template>
<style lang="scss" scoped>
.borde-enlace-activo {
  border-bottom: 4px solid var(--boton-primario-borde);
  border-radius: 0px;
}
</style>
