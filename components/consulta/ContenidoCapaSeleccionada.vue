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
const paginaActual = ref(0);
const tamanioPagina = 10;
const {
  variables,
  datos,
  totalFeatures,
  refetch: fetchTable,
} = useGeoserverDataTable({
  paginaActual: paginaActual.value,
  tamanioPagina: tamanioPagina,
  resource: selectedElement.value,
});

watch(paginaActual, () => {
  fetchTable({
    paginaActual: paginaActual.value,
    tamanioPagina: tamanioPagina,
    resource: selectedElement.value,
  });
});
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
