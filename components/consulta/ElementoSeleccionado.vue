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
</script>
<template>
  <div class="tarjeta m-y-1">
    <div class="tarjeta-cuerpo">
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
        v-if="resourceType === 'dataset'"
        :resource-type="resourceType"
        :selected-element="selectedElement"
      />

      <ConsultaContenidoDocSeleccionado
        v-if="resourceType !== 'dataset'"
        :group-name="resourceType"
        :resource-type="resourceType"
        :selected-element="selectedElement"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.tarjeta-cuerpo {
  padding: 16px;
}
.encabezado-tarjeta {
  align-items: center;
}
</style>
