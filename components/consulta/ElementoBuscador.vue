<script setup>
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

const sisdaiModal = ref(null);
//const categories = ref(["opcion 1", "opcion 2", "opcion 3"]);
const selectedCategory = ref(null);
const institucionInput = ref(null);
const yearInput = ref(null);
const keywordsInput = ref(null);

function filterByKeywords(r) {
  catalogoFiltrado.value = r;
  resourcesStore.updateFilteredResources(
    resourceType.value,
    catalogoFiltrado.value
  );
}

function filterByModal() {
  console.log(
    selectedCategory.value,
    institucionInput.value,
    yearInput.value,
    keywordsInput.value
  );
  sisdaiModal.value.cerrarModal();
}
</script>
<template>
  <SisdaiModal ref="sisdaiModal">
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
            v-model="selectedCategory"
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
            v-model="institucionInput"
          />

          <SisdaiCampoBase
            class="m-y-2"
            etiqueta="Año de publicación"
            ejemplo="1995..."
            v-model="yearInput"
          />

          <SisdaiCampoBase
            class="m-y-2"
            etiqueta="Palabras clave"
            ejemplo="agua, casas..."
            v-model="keywordsInput"
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
      @alFiltrar="filterByKeywords"
    />
    <button
      type="button"
      class="boton-primario boton-pictograma boton-grande"
      aria-label="Filtro Avanzado"
      @click="sisdaiModal?.abrirModal()"
    >
      <span class="pictograma-filtro" aria-hidden="true"></span>
    </button>
  </div>
</template>
