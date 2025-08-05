<script setup>
const props = defineProps({
  elementUuid: {
    type: String,
    default: undefined,
  },
  resourceType: { type: String, required: true },
});
const { elementUuid, resourceType } = toRefs(props);
const fetchedStore = useFetchedResourcesStore()
const selectedElement = fetchedStore.findResource(elementUuid.value, resourceType.value)
console.log("aqui:", selectedElement)
/* if (!resourcesStore.shownFiles[resourceType.value]) {
  let firstSelection = resourcesStore.selectedResources[resourceType.value][0];
  resourcesStore.setShownFile(resourceType.value, firstSelection);
} */

</script>
<template>
  <div class="tarjeta m-y-1">
    <div class="tarjeta-selected">
      <div class="flex flex-contenido-separado m-0 encabezado-tarjeta">
        <p class="tarjeta-texto-secundario m-0">Categoria</p>
        <div class="m-0">
<!--           <button
            v-globo-informacion:izquierda="{
              contenido: tooltipContent(selectedElement),
              desfase: [0, 8],
            }"
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Mostrar información"
            type="button"
          > -->
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Mostrar información"
            type="button"
          >
            <span class="pictograma-informacion pictograma-mediano" aria-hidden="true" />
          </button>

          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Subir elemento"
            type="button"
          >
            <span class="pictograma-subir-capa pictograma-mediano" aria-hidden="true" />
          </button>

          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Bajar Elemento"
            type="button"
          >
            <span class="pictograma-bajar-capa pictograma-mediano" aria-hidden="true" />
          </button>
        </div>
      </div>
      
      <ConsultaContenidoCapaSeleccionada
        v-if="resourceType === 'dataLayer'"
        :resource-type="resourceType"
        :selected-element="selectedElement"
      />

     <ConsultaContenidoDocSeleccionado
        v-if="resourceType !== 'dataLayer'"
        :group-name="resourceType"
        :resource-type="resourceType"
        :selected-element="selectedElement"
      /> 
    </div>
  </div>
</template>
<style lang="scss" scoped>
.tarjeta-selected {
  padding: 16px;
  background-color: var(--color-secundario-2);
}
.selected-unselected {
  padding: 16px;
  background-color: var(--color-neutro-1);
}
.encabezado-tarjeta {
  align-items: center;
}
</style>
