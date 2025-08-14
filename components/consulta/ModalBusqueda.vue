<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

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
  selectedCategory: [],
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
    selectedFilter.value['selectedCategory'].length > 0 &&
    selectedFilter.value['selectedCategory'].includes(d.category.gn_description)
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
    const i = filterByYear(d) + filterByKeyword(d);
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
          <label>Categoria</label>
          <div class="grupo-categoria flex">
            <SisdaiCasillaVerificacion 
              v-model="selectedFilter['selectedCategory']"
              v-for="(category, index) in categories"
              :key="`${index}-category`"
              :value="category"
              :etiqueta="category"
              class="opcion-checkbox"
              />
              <button class="boton-chico opcion-checkbox">Limpiar selección</button>
          </div>

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
      </template>

      <template #pie>
        <div class="contenedor-botones flex flex-contenido-centrado">
          <button @click="filterByModal" class="boton-chico boton-primario">Buscar</button>
          <button @click="resetResults" class="boton-chico boton-secundario">Restablecer filtros</button>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
<style lang="scss" scoped>
.grupo-categoria {
  border: solid var(--campo-etiqueta-color) 1px;
  border-radius: 8px;
  gap: 0px;

  button{
    font-size: 1rem;
    color: var(--color-interactivo-1);
    background-color: var(--color-neutro-0);
    border-radius: 8px;
  }
}
.opcion-checkbox{
  width: 50%;
}
.contenedor-botones{
  width: 100%;
  
  button{
   width: 45%
   }
}
</style>
