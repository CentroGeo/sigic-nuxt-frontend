<script setup>
// TODO: Componentizar las secciones de categorias
// TODO: Arreglar los filtros de categorias: que sí reflejen categorias
const props = defineProps({
  titulo: { type: String, default: "Título" },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
});
const { titulo, resourceType } = toRefs(props);
const { resourcesList } = useGeonodeResources({
  pageNumber: 1,
  pageSize: 20,
  resourceType: resourceType.value,
});
const categories = ref({});
const selectedCategory = ref();
function groupResults() {
  categories.value = {};
  resourcesList.value.map((r) => {
    const anio = r.date.slice(0, 4);
    if (Object.keys(categories.value).includes(anio)) {
      categories.value[anio].push(r);
    } else {
      categories.value[anio] = [];
      categories.value[anio].push(r);
    }
  });
}

function setSelectedCategory(categoria) {
  selectedCategory.value = categoria;
}

// Se utiliza un watcher porque inicialmente resourcesList está vacía
watch(resourcesList, () => {
  groupResults();
});

watch(selectedCategory, () => {
  console.log(selectedCategory.value);
});
</script>

<template>
  <div>
    <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

    <div class="m-x-2 m-y-1">
      <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

      <ConsultaElementoBuscador />

      <UiNumeroElementos
        :numero="resourcesList.length"
        :etiqueta="etiquetaElementos"
      />
    </div>

    <div
      v-for="category in Object.keys(categories)"
      :key="category"
      class="panel-catalogo"
    >
      <div class="tarjeta">
        <ConsultaElementoCategoria
          :title="category"
          :tag="etiquetaElementos"
          :number-elements="categories[category].length"
          @click="setSelectedCategory(category)"
        />
      </div>
      <ConsultaElementoCatalogo
        v-if="category == selectedCategory"
        v-for="(option, index) in categories[category]"
        :key="index"
        :catalogue-element="option"
        :resource-type="resourceType"
      />
    </div>
  </div>
</template>
<style lang="scss">
.panel-catalogo {
  padding: 0px 8px;
}
</style>
