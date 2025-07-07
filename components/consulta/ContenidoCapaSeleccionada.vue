<script setup>
const resourcesStore = useSelectedResourcesStore();

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);
</script>
<template>
  <!-- El contenido de la tarjeta de capas  -->
  <div class="m-b-5">
    <p class="tarjeta-titulo m-y-2">
      {{ selectedElement.title }}
    </p>
  </div>

  <div class="flex flex-contenido-final contenedor-botones">
    <button
      class="boton-pictograma"
      aria-label="Hacer zoo,"
      type="button"
      @click="resourcesStore.removeResource(resourceType, selectedElement)"
    >
      <span class="pictograma-zoom-instruccional" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma"
      aria-label="Ver tablas"
      type="button"
      @click="resourcesStore.removeResource(resourceType, selectedElement)"
    >
      <span class="pictograma-tabla" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma"
      aria-label="Ver"
      type="button"
      @click="resourcesStore.removeResource(resourceType, selectedElement)"
    >
      <span class="pictograma-ojo-ver" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma"
      aria-label="Editar"
      type="button"
      @click="resourcesStore.removeResource(resourceType, selectedElement)"
    >
      <span class="pictograma-editar" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma"
      aria-label="Quitar selección"
      type="button"
      @click="resourcesStore.removeResource(resourceType, selectedElement)"
    >
      <span class="pictograma-eliminar" aria-hidden="true"></span>
    </button>
    <button
      class="boton-pictograma"
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
