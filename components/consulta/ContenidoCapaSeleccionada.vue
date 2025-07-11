<script setup>
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";

const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);
const modalTabla = ref(null);

// Todo esto es del llamado a GeoServer
const config = useRuntimeConfig();
const variables = ref([]);
const datos = ref([]);
const paginaActual = ref(0);
const totalFeatures = ref(0);
const tamanioPagina = 10;

const obtenerDatos = async () => {
  const url = new URL(`${config.public.geoserverUrl}/ows`);
  url.search = new URLSearchParams({
    service: "WFS",
    version: "1.0.0",
    request: "GetFeature",
    typeName: selectedElement.value.alternate,
    outputFormat: "application/json",
    maxFeatures: tamanioPagina,
    startIndex: paginaActual.value * tamanioPagina,
  }).toString();

  const res = await fetch(url);
  const data = await res.json();
  if (data.totalFeatures !== undefined) {
    totalFeatures.value = data.totalFeatures;
  }

  const atributos = data.features.map((f) => f.properties);
  variables.value = Object.keys(atributos[0] || {});
  datos.value = atributos;
};
watch(paginaActual, obtenerDatos, { immediate: true });
// Aquí termina lo del llamado a geoserver
</script>
<template>
  <SisdaiModal ref="modalTabla">
    <template #encabezado>
      <h1>{{ selectedElement.title }}</h1>
    </template>

    <template #cuerpo>
      <UiTablaAccesible :variables="variables" :datos="datos" />
      <UiPaginador
        :totalPaginas="Math.ceil(totalFeatures / tamanioPagina)"
        @cambio="paginaActual = $event"
      />
    </template>
  </SisdaiModal>

  <!-- El contenido de la tarjeta de capas  -->
  <div class="m-b-5">
    <p class="tarjeta-titulo m-y-2">
      {{ selectedElement.title }}
    </p>
    <p class="tarjeta-etiqueta">Variables disponibles</p>
  </div>

  <div class="flex flex-contenido-final">
    <button
      class="boton-pictograma boton-sin-contenedor-secundario"
      aria-label="Hacer zoom"
      type="button"
    >
      <span class="pictograma-zoom-instruccional" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma boton-sin-contenedor-secundario"
      aria-label="Ver tablas"
      type="button"
      @click="modalTabla?.abrirModal()"
    >
      <span class="pictograma-tabla" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma boton-sin-contenedor-secundario"
      aria-label="Ver"
      type="button"
    >
      <span class="pictograma-ojo-ver" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma boton-sin-contenedor-secundario"
      aria-label="Editar"
      type="button"
    >
      <span class="pictograma-editar" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma boton-sin-contenedor-secundario"
      aria-label="Quitar selección"
      type="button"
      @click="resourcesStore.removeResource(resourceType, selectedElement)"
    >
      <span class="pictograma-eliminar" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma boton-sin-contenedor-secundario"
      aria-label="Descargar selección"
      type="button"
    >
      <span class="pictograma-archivo-descargar" aria-hidden="true"></span>
    </button>
  </div>
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
