<script setup>
// De momento el campo de búsqueda, busca únicamente en el titulo
// Además, el filtro avanzado de institución no funciona
// porque hay que revisar en el módulo de carga cómo se recolectará esa información
// El filtro avanzado de keywords está buscando en el título únicamente
// Falta poder volver a deseleccionar los filtros
import SisdaiCampoBusqueda from "@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue";
import SisdaiModal from "@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue";
import SisdaiSelector from "@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue";
import SisdaiCampoBase from "@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue";

const resourcesStore = useSelectedResourcesStore();
const props = defineProps({
  resourcesList: { type: Array, default: () => [] },
  resourceType: { type: String, required: true },
  categories: { type: Array, default: () => [] },
});
const { resourcesList, resourceType, categories } = toRefs(props);
const catalogoFiltrado = ref(resourcesList.value);
const modalFiltros = ref(null);
const selectedFilter = ref({
  selectedCategory: null,
  institucionInput: null,
  yearInput: null,
  keywordsInput: null,
});

function filterByCategory(d) {
  if (
    d.category !== null &&
    selectedFilter.value["selectedCategory"] &&
    d.category.gn_description == selectedFilter.value["selectedCategory"]
  ) {
    return 1;
  } else {
    return 0;
  }
}

function filterByYear(d) {
  if (
    d.date !== null &&
    selectedFilter.value["yearInput"] &&
    d.date.slice(0, 4) === selectedFilter.value["yearInput"]
  ) {
    return 1;
  } else {
    return 0;
  }
}

// Para esta función haría falta formatear el input y el título del recursp
function filterByKeyword(d) {
  if (selectedFilter.value["keywordsInput"]) {
    let keywordsList = selectedFilter.value["keywordsInput"]
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word.length > 0);
    let includesWord = keywordsList.some((keyword) =>
      d.title.includes(keyword)
    );
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
  let results = [];
  // Revisamos cuántos filtros se aplicaron
  Object.keys(selectedFilter.value).forEach((d) => {
    if (selectedFilter.value[d]) {
      total += 1;
    }
  });
  // Revisamos la suma por filtro
  resourcesList.value.forEach((d) => {
    let i = filterByCategory(d) + filterByYear(d) + filterByKeyword(d);
    if (i === total) {
      results.push(d);
    }
  });
  catalogoFiltrado.value = results;
  resourcesStore.updateFilteredResources(
    resourceType.value,
    catalogoFiltrado.value
  );
  modalFiltros.value.cerrarModal();
}

function filterByInput(r) {
  catalogoFiltrado.value = r;
  resourcesStore.updateFilteredResources(
    resourceType.value,
    catalogoFiltrado.value
  );
}
</script>
<template>
  <SisdaiModal ref="modalFiltros">
    <template #encabezado>
      <h1>Filtro avanzado</h1>
    </template>

    <template #cuerpo>
      <ClientOnly>
        <div>
          <SisdaiSelector
            class="m-y-2"
            etiqueta="Categoría"
            instruccional="Selecciona Categoría"
            v-model="selectedFilter['selectedCategory']"
          >
            <option
              v-for="(category, index) in categories"
              :value="category"
              :key="`${index}-category`"
            >
              {{ category }}
            </option>
          </SisdaiSelector>

          <SisdaiCampoBase
            class="m-y-2"
            etiqueta="Institución"
            ejemplo="SECIHTI, INEGI, entre otras"
            v-model="selectedFilter['institucionInput']"
          />

          <SisdaiCampoBase
            class="m-y-2"
            etiqueta="Año de publicación"
            ejemplo="1995..."
            v-model="selectedFilter['yearInput']"
          />

          <SisdaiCampoBase
            class="m-y-2"
            etiqueta="Palabras clave"
            ejemplo="agua, casas..."
            v-model="selectedFilter['keywordsInput']"
          />
        </div>
      </ClientOnly>
    </template>

    <template #pie>
      <button @click="filterByModal">Aplicar</button>
    </template>
  </SisdaiModal>

  <div class="flex flex-contenido-equidistante m-y-3">
    <SisdaiCampoBusqueda
      class="columna-13"
      :catalogo="resourcesList"
      :propiedadBusqueda="'title'"
      :etiqueta="'Usa palabras clave...'"
      @alFiltrar="filterByInput"
    />
    <button
      type="button"
      class="boton-primario boton-pictograma boton-grande"
      aria-label="Filtro Avanzado"
      @click="modalFiltros?.abrirModal()"
    >
      <span class="pictograma-filtro" aria-hidden="true"></span>
    </button>
  </div>
</template>
