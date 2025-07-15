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
const isChecked = ref(false);

const type = ref(catalogueElement.value.resource_type);
const subtype = ref(catalogueElement.value.subtype);
const bbox_polygon = ref(catalogueElement.value.bbox_polygon.type);
const buttons = ref([
  {
    label:
      `<p>Descripción: ${catalogueElement.value.abstract}</p>` +
      `<p>Origen: ${catalogueElement.value.attribution}</p>` +
      `<p>Creación: ${catalogueElement.value.created}</p>` +
      `<p>Revisión: ${catalogueElement.value.date}</p>` +
      `<p>Keywords: ${catalogueElement.value.keywords}</p>` +
      `<p>CRS: ${catalogueElement.value.srid}</p>`,
    class: "pictograma-informacion",
    index: 3,
  },
]);

// Revisamos qué tipo de documento estamos mostrando para decidir qué botones mostrar
if (type.value === "dataset") {
  buttons.value.push({
    label: "Variables disponibles",
    class: "pictograma-visualizador",
    index: 2,
    tooltipInfo: "No de estilos",
  });

  if (subtype.value == "vector") {
    if (bbox_polygon.value === "Polygon") {
      buttons.value.push({
        label: "Capa de poligonos",
        class: "pictograma-capa-poligono",
        index: 1,
      });
    } else if (bbox_polygon.value === "LineString") {
      buttons.value.push({
        label: "Capa de lineas",
        class: "pictograma-capa-lineas",
        index: 1,
      });
    } else if (bbox_polygon.value === "Points") {
      buttons.value.push({
        label: "Capa de puntos",
        class: "pictograma-capa-puntos",
        index: 1,
      });
    }
  } else {
    buttons.value.push({
      label: "Capa tipo raster",
      class: "pictograma-capas",
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
  <div class="m-x-5 m-y-2" :id="`elemento-${catalogueElement.uuid}`">
    <div
      class="tarjeta-elemento"
      @click="selectElement(resourceType, catalogueElement)"
    >
      <input
        type="checkbox"
        :id="`checkbox-${catalogueElement.uuid}`"
        v-model="isChecked"
      />
      <label :for="catalogueElement.uuid">{{ catalogueElement.title }}</label>
    </div>

    <div class="flex flex-contenido-inicio m-y-3">
      <span
        v-for="button in buttons"
        :class="[button.class, 'pictograma-mediano']"
        aria-hidden="true"
        v-globo-informacion:arriba="button.label"
      ></span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.flex {
  gap: 8px;
}
.tarjeta-elemento:hover {
  background-color: var(--color-secundario-2);
  border: 1px solid var(--color-secundario-8);
  border-radius: 8px;
}
</style>
