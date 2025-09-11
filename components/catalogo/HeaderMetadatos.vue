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
const bordeEnlaceActivo = (ruta) => {
  if (route.path === ruta) {
    return 'borde-enlace-activo';
  }
  return '';
};

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
</script>
<template>
  <h2>{{ props.resource.title }}</h2>

  <div class="flex">
    <nuxt-link :class="bordeEnlaceActivo('/catalogo/mis-archivos/editar/MetadatosBasicos')"
      >Metadatos
    </nuxt-link>
    <nuxt-link
      v-if="tieneEstilo()"
      :class="bordeEnlaceActivo('/catalogo/mis-archivos/editar/estilo')"
      >Estilo
    </nuxt-link>
    <nuxt-link :class="bordeEnlaceActivo('/catalogo/mis-archivos/unir-vectores')"
      >Clave Geoestadística
    </nuxt-link>
  </div>
  <div class="borde-b borde-color-secundario"></div>

  <h2>Metadatos</h2>
  <div style="display: flex; gap: 4px">
    <div
      class="borde borde-grosor-2"
      style="width: 25%; border-color: var(--color-primario-1)"
    ></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div>
    <div class="borde borde-grosor-2" style="width: 25%; border-color: var(--color-neutro-2)"></div>
  </div>
  <ol>
    <li>{{ props.title }}</li>
  </ol>
</template>
