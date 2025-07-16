<script setup>
import { ref, toRefs } from "vue";
import { useSelectedResourcesStore } from "~/stores/selectedResources.js";

const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  resourceType: {
    type: String,
    default: String,
  },
  catalogueElement: {
    type: Object,
    default: Object,
  },
});
const { resourceType, catalogueElement } = toRefs(props);
const type = ref(catalogueElement.value.resource_type);
//const subtype = ref(catalogueElement.value.subtype);
const subtype = ref("polygon");
const buttons = ref([
  {
    label: "Información",
    class: "pictograma-informacion",
    index: 3,
  },
]);
const isChecked = ref(false);

// Si está en la lista de elementos seleccionados, mostrarla palomeada. Esto es para cuando cambiamos de vista
function setCheck() {
  if (
    resourcesStore.selectedResources[resourceType.value]?.some(
      (r) => r.uuid === catalogueElement.value.uuid
    )
  ) {
    isChecked.value = true;
  } else {
    isChecked.value = false;
  }
}
setCheck();

// Revisamos qué tipo de documento estamos mostrando para decidir qué botones mostrar
if (type.value === "dataset") {
  buttons.value.push({
    label: "Variables disponibles",
    class: "pictograma-visualizador",
    index: 2,
  });

  if (subtype.value === "polygon") {
    buttons.value.push({
      label: "Capa de poligonos",
      class: "pictograma-capa-poligono",
      index: 1,
    });
  } else if (subtype.value === "lines") {
    buttons.value.push({
      label: "Capa de lineas",
      class: "pictograma-capa-lineas",
      index: 1,
    });
  } else if (subtype.value === "dots") {
    buttons.value.push({
      label: "Capa de puntos",
      class: "pictograma-capa-puntos",
      index: 1,
    });
  }
}
// Ordenamos la lista de botones
buttons.value.sort((a, b) => a.index - b.index);

// Manjeamos el checkbox y controlamos los elementos seleccionados
function selectElement(resourceType, option) {
  isChecked.value = !isChecked.value;
  if (isChecked.value) {
    resourcesStore.addResource(resourceType, option);
  } else {
    resourcesStore.removeResource(resourceType, option);
  }
}

// Como también se puede modificar la lista desde el panel de seleccion, montamos un watcher
// para despalomear las opciones que se borraron
watch(
  () => resourcesStore.selectedResources[resourceType.value],
  () => {
    setCheck();
  },
  { deep: true }
);
</script>
<template>
  <div
    class="contenedor-elemento"
    :id="`elemento-${catalogueElement.uuid}`"
    @click="selectElement(resourceType, catalogueElement)"
  >
    <input
      type="checkbox"
      :id="`checkbox-${catalogueElement.uuid}`"
      v-model="isChecked"
    />
    <label :for="catalogueElement.uuid">{{ catalogueElement.title }}</label>
    <div class="contenedor-botones">
      <span
        v-for="button in buttons"
        :class="[button.class, 'pictograma-mediano']"
        aria-hidden="true"
      ></span>
    </div>
  </div>
</template>
<style lang="scss">
.contenedor-elemento {
  //background-color: pink;
  margin: 0px;
  padding: 15px 0px 15px 5%;
  border-bottom: solid 2px #d4d4d4;
}
.contenedor-botones {
  //background-color: cyan;
  display: flex;
  gap: 3px;
  padding: 6px;
}
/* .pictograma-mediano {
  background-color: pink;
} */
</style>
