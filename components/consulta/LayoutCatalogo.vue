<script setup>
// PENDING: El buscador sisdai genera un error que dice "Hidration completed but contains mismatches"
const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  titulo: { type: String, default: "Título" },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
});
const { titulo, resourceType } = toRefs(props);
const { resourcesList } = useGeonodeResources({
  pageNumber: 1,
  pageSize: 30,
  resourceType: resourceType.value,
});

const filteredResources = ref([]);
const config = useRuntimeConfig();
const apiCategorias = `${config.public.geonodeApi}/facets/category`;
const categoryList = ref([]);
const categorizedResources = ref({});
const selectedCategories = ref([]);

// Esta parte es para obtener todas las categorias
const { data: geonodeCategories } = await useFetch(`${apiCategorias}`);
if (!geonodeCategories.value) {
  categoryList.value = ["Sin clasificar"];
} else {
  geonodeCategories.value.topics.items.map((d) => {
    categoryList.value.push(d.label);
  });
}

function groupResults() {
  categorizedResources.value = {};
  filteredResources.value.map((r) => {
    if (r.category) {
      let title = r.category.gn_description;
      if (Object.keys(categorizedResources.value).includes(title)) {
        categorizedResources.value[title].push(r);
      } else {
        categorizedResources.value[title] = [];
        categorizedResources.value[title].push(r);
      }
    } else {
      if (Object.keys(categorizedResources.value).includes("Sin clasificar")) {
        categorizedResources.value["Sin clasificar"].push(r);
      } else {
        categorizedResources.value["Sin clasificar"] = [];
        categorizedResources.value["Sin clasificar"].push(r);
      }
    }
  });
}

function setSelectedCategory(categoria) {
  if (selectedCategories.value.includes(categoria)) {
    selectedCategories.value = selectedCategories.value.filter(
      (c) => c !== categoria
    );
  } else {
    selectedCategories.value.push(categoria);
  }
}

// Se utiliza un watcher porque inicialmente resourcesList y filteredResources están vacías
watch(resourcesList, () => {
  resourcesStore.updateFilteredResources(
    resourceType.value,
    resourcesList.value
  );
});
watch(
  () => resourcesStore.filteredResources[resourceType.value],
  () => {
    filteredResources.value =
      resourcesStore.filteredResources[resourceType.value];
    groupResults();
  },
  { deep: true }
);
</script>

<template>
  <div class="catalogo-layout">
    <div class="controles-catalogo">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>
        <ClientOnly>
          <ConsultaElementoBuscador
            :resources-list="resourcesList"
            :resource-type="resourceType"
            :categories="categoryList"
          />
        </ClientOnly>

        <UiNumeroElementos
          :numero="filteredResources.length"
          :etiqueta="etiquetaElementos"
        />
      </div>
    </div>

    <div
      v-for="category in Object.keys(categorizedResources)"
      :key="category"
      class="m-y-1"
    >
      <div class="">
        <ConsultaElementoCategoria
          :title="category"
          :tag="etiquetaElementos"
          :number-elements="categorizedResources[category].length"
          @click="setSelectedCategory(category)"
        />
      </div>
      <div
        class="contenedor-archivos"
        v-if="selectedCategories.includes(category)"
        v-for="(option, index) in categorizedResources[category]"
      >
        <ConsultaElementoCatalogo
          class="elemento-catalogo"
          :key="index"
          :catalogue-element="option"
          :resource-type="resourceType"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.contenedor-archivos {
  border-bottom: solid 2px var(--color-neutro-3);
}
.catalogo-layout {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}
.controles-catalogo {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--color-neutro-0);
}
</style>
