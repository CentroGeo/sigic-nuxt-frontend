<script setup>
import { tooltipContent } from "~/utils/consulta.js";
const selectedStore = useSelectedResourcesStore();
const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);

if (!selectedStore.shownFiles[resourceType.value]) {
  let firstSelection = selectedStore.selectedResources[resourceType.value][0];
  selectedStore.setShownFile(resourceType.value, firstSelection);
}

/* const isChecked = computed(() => {
  if (resourceType.value !== "dataLayer") {
    if (
      selectedElement.value.uuid ===
      selectedStore.shownFiles[resourceType.value].uuid
    ) {
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
}); */
</script>
<template>
  <div class="tarjeta m-y-1">
    <!--     <div :class="isChecked ? 'tarjeta-selected' : 'selected-unselected'"> -->
    <div class="tarjeta-selected">
      <div class="flex flex-contenido-separado m-0 encabezado-tarjeta">
        <p class="tarjeta-texto-secundario m-0">Categoria</p>
        <div class="m-0">
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Mostrar información"
            type="button"
            v-globo-informacion:izquierda="{
              contenido: tooltipContent(selectedElement),
              desfase: [0, 8],
            }"
          >
            <span
              class="pictograma-informacion pictograma-mediano"
              aria-hidden="true"
            ></span>
          </button>

          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Subir elemento"
            type="button"
            @click="selectedStore.raiseIndex(selectedElement, resourceType)"
          >
            <span
              class="pictograma-subir-capa pictograma-mediano"
              aria-hidden="true"
            ></span>
          </button>

          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Bajar Elemento"
            type="button"
            @click="selectedStore.lowerIndex(selectedElement, resourceType)"
          >
            <span
              class="pictograma-bajar-capa pictograma-mediano"
              aria-hidden="true"
            ></span>
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
