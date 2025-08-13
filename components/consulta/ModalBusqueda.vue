<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const props = defineProps({
  categories: { type: Array, default: () => [] },
  resourceType: { type: String, required: true },
});
const { categories } = toRefs(props);
const storeFetched = useFetchedResourcesStore();
const resources = computed(() => storeFetched[props.resourceType]);
const emit = defineEmits(['updateResults']);
const modalBusqueda = ref(null);
const selectedFilter = ref({
  selectedCategory: null,
  institucionInput: null,
  yearInput: null,
  keywordsInput: null,
});
const results = ref([])
function abrirModalBusqueda() {
  modalBusqueda.value?.abrirModal();
}

defineExpose({
  abrirModalBusqueda,
});

function filterByCategory(d) {
  if (
    d.category !== null &&
    selectedFilter.value['selectedCategory'] &&
    d.category.gn_description === selectedFilter.value['selectedCategory']
  ) {
    return 1;
  } else {
    return 0;
  }
}

function filterByYear(d) {
  if (
    d.date !== null &&
    selectedFilter.value['yearInput'] &&
    d.date.slice(0, 4) === selectedFilter.value['yearInput']
  ) {
    return 1;
  } else {
    return 0;
  }
}

// Para esta función haría falta formatear el input y el título del recursp
function filterByKeyword(d) {
  if (selectedFilter.value['keywordsInput']) {
    const keywordsList = selectedFilter.value['keywordsInput']
      .split(',')
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
    const includesWord = keywordsList.some((keyword) => d.title.includes(keyword));
    if (includesWord) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
} 

// La idea sería generar un filtro por categoría y, sacar el numero de filtros aplicados y
// revisar que sumen un total
function filterByModal() {
  let total = 0;
  const prevResults = [];
  // Revisamos cuántos filtros se aplicaron
  Object.keys(selectedFilter.value).forEach((d) => {
    if (selectedFilter.value[d]) {
      total += 1;
    }
  });
  // Revisamos la suma por filtro
   resources.value.forEach((d) => {
    const i = filterByCategory(d) + filterByYear(d) + filterByKeyword(d);
    if (i === total) {
      prevResults.push(d);
    }
  });
  results.value = prevResults;
  emit('updateResults', results.value)
  modalBusqueda.value.cerrarModal();
}

function resetResults(){
  results.value = resources.value
  emit('updateResults', results.value)
  modalBusqueda.value.cerrarModal();
}

</script>
<template>
  <ClientOnly>
    <SisdaiModal ref="modalBusqueda">
      <template #encabezado>
        <h1>Filtro avanzado</h1>
      </template>

      <template #cuerpo>
        <div>
          <SisdaiSelector
            v-model="selectedFilter['selectedCategory']"
            class="m-y-2"
            etiqueta="Categoría"
            instruccional="Selecciona Categoría"
          >
            <option
              v-for="(category, index) in categories"
              :key="`${index}-category`"
              :value="category"
            >
              {{ category }}
            </option>
          </SisdaiSelector>

          <SisdaiCampoBase
            v-model="selectedFilter['institucionInput']"
            class="m-y-2"
            etiqueta="Institución"
            ejemplo="SECIHTI, INEGI, entre otras"
          />

          <SisdaiCampoBase
            v-model="selectedFilter['yearInput']"
            class="m-y-2"
            etiqueta="Año de publicación"
            ejemplo="1995..."
          />

          <SisdaiCampoBase
            v-model="selectedFilter['keywordsInput']"
            class="m-y-2"
            etiqueta="Palabras clave"
            ejemplo="agua, casas..."
          />
        </div>
      </template>

      <template #pie>
        <button @click="filterByModal">Buscar</button>
        <button @click="resetResults">Restablecer filtros</button>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
