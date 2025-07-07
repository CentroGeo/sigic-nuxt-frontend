<script setup>
const shownStore = useShownFilesStore();
const resourcesStore = useSelectedResourcesStore();

const props = defineProps({
  groupName: { type: String, required: true },
  selectedElement: {
    type: Object,
    default: () => ({}),
  },
  resourceType: { type: String, required: true },
});
const { selectedElement, resourceType } = toRefs(props);

const isChecked = ref(false);

function setShownElement() {
  shownStore.setShownFile(resourceType.value, selectedElement.value);
}

/* function setCheck() {
  console.log(
    "se disparo la funcion que checa botones, ",
    shownStore.shownFiles[resourceType.value].uuid
  );

  if (
    selectedElement.value.uuid ===
    shownStore.shownFiles[resourceType.value].uuid
  ) {
    isChecked.value = false;
  } else {
    isChecked.value = true;
  }
}
setCheck();

watch(
  () => shownStore.shownFiles[resourceType.value],
  () => {
    setCheck();
  },
  { deep: true }
); */
</script>

<template>
  <div>
    <div @click="setShownElement">
      <input :id="selectedElement.uuid" type="radio" :name="groupName" />
      <label :for="selectedElement.uuid">{{ selectedElement.title }}</label>
    </div>

    <div class="flex flex-contenido-final">
      <button
        class="boton-pictograma"
        aria-label="Remover selección"
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
  </div>
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
</style>
