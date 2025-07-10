<script setup>
const shownStore = useShownFilesStore();
const selectedStore = useSelectedResourcesStore();

const props = defineProps({
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);

if (!shownStore.shownFiles[resourceType.value]) {
  //console.log("si vacio", !shownStore.shownFiles[resourceType.value]);
  let firstSelection = selectedStore.selectedResources[resourceType.value][0];
  shownStore.setShownFile(resourceType.value, firstSelection);
}

/* const isChecked = computed(() => {
  if (resourceType.value !== "dataLayer") {
    if (
      selectedElement.value.uuid ===
      shownStore.shownFiles[resourceType.value].uuid
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
          <span
            class="pictograma-informacion pictograma-mediano"
            aria-hidden="true"
          ></span>
          <span
            class="pictograma-subir-capa pictograma-mediano"
            aria-hidden="true"
          ></span>
          <span
            class="pictograma-bajar-capa pictograma-mediano"
            aria-hidden="true"
          ></span>
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
