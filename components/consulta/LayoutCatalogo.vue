<script setup>
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

// Se utiliza un watcher porque inicialmente resourcesList está vacía
watch(resourcesList, () => {
  groupResults();
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
      <h2>{{ category }}</h2>
      <ConsultaElementoCatalogo
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
