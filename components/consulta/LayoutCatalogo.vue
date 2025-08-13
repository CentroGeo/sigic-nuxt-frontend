<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';

const storeFetched = useFetchedResourcesStore();
const props = defineProps({
  titulo: { type: String, default: 'Título' },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
});
const { titulo, resourceType } = toRefs(props);
const config = useRuntimeConfig();
const resources = computed(() => storeFetched[props.resourceType]);
const filteredResources = ref()
const apiCategorias = `${config.public.geonodeApi}/facets/category`;
const categoryList = ref([]);
const categorizedResources = ref({});
const selectedCategories = ref([]);
const modalFiltroAvanzado = ref(null)

// Esta parte es para obtener todas las categorias
const { data: geonodeCategories } = await useFetch(`${apiCategorias}`);
if (!geonodeCategories.value) {
  categoryList.value = ['Sin clasificar'];
} else {
  geonodeCategories.value.topics.items.map((d) => {
    categoryList.value.push(d.label);
  });
}

function groupResults() {
  categorizedResources.value = {};
  filteredResources.value.map((r) => {
    if (r.category) {
      const title = r.category.gn_description;
      if (Object.keys(categorizedResources.value).includes(title)) {
        categorizedResources.value[title].push(r);
      } else {
        categorizedResources.value[title] = [];
        categorizedResources.value[title].push(r);
      }
    } else {
      if (Object.keys(categorizedResources.value).includes('Sin clasificar')) {
        categorizedResources.value['Sin clasificar'].push(r);
      } else {
        categorizedResources.value['Sin clasificar'] = [];
        categorizedResources.value['Sin clasificar'].push(r);
      }
    }
  });
}

function setSelectedCategory(categoria) {
  if (selectedCategories.value.includes(categoria)) {
    selectedCategories.value = selectedCategories.value.filter((c) => c !== categoria);
  } else {
    selectedCategories.value.push(categoria);
  }
}

function filterByInput(r) {
  filteredResources.value = r;
  groupResults()
}

function updateByModal(resources){
  filteredResources.value = resources
  groupResults()
  console.log('escuchó')
}

onMounted(async () => {
  if (resources.value.length === 0) {
    storeFetched.isLoading = true;
    const { resourcesList } = await useGeonodeResources();
    storeFetched.updateFetchedResources(props.resourceType, resourcesList.value);
    filteredResources.value = storeFetched[props.resourceType];
    storeFetched.isLoading = false;
  }else{
    filteredResources.value = storeFetched[props.resourceType];
  }
  groupResults();
});

</script>

<template>
  <div class="catalogo-layout">
    <div class="encabeado-catalogo">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <p class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

        <ClientOnly>
          <div class="flex flex-contenido-equidistante m-y-3">
            <SisdaiCampoBusqueda
              class="columna-13"
              :catalogo="resources"
              :propiedad-busqueda="'title'"
              :etiqueta="'Usa palabras clave...'"
              @al-filtrar="filterByInput"
            />
            <button
              type="button"
              class="boton-primario boton-pictograma boton-grande"
              aria-label="Filtro Avanzado"
              @click="modalFiltroAvanzado.abrirModalBusqueda"
            >
              <span class="pictograma-filtro" aria-hidden="true" />
            </button>
          </div>
        </ClientOnly> 
        <UiNumeroElementos :numero="resources.length" :etiqueta="etiquetaElementos" />
      </div>
    </div>

    <div v-for="category in Object.keys(categorizedResources)" :key="category" class="m-y-1">
      <div class="">
        <ConsultaElementoCategoria
          :title="category"
          :tag="etiquetaElementos"
          :number-elements="categorizedResources[category].length"
          @click="setSelectedCategory(category)"
        />
      </div>
      <div
        v-for="(resource, index) in categorizedResources[category]"
        :key="index"
        class="contenedor-archivos"
      >
        <ConsultaElementoCatalogo
          v-if="selectedCategories.includes(category)"
          :key="index"
          class="elemento-catalogo"
          :catalogue-element="resource"
          :resource-type="resourceType"
        />
      </div>
    </div>
  </div>
  <ConsultaModalBusqueda 
    ref="modalFiltroAvanzado"
    :resource-type="props.resourceType"
    :categories="categoryList"
    @update-results="(results) => updateByModal(results)"
  />
</template>

<style lang="scss" scoped>
.catalogo-layout {
  height: var(--altura-consulta-esc);
  overflow-y: auto;
  overflow-x: hidden;

  .encabeado-catalogo {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--fondo);
    padding-bottom: 8px;
  }

  .lista-catalogo {
    background-color: var(--color-neutro-3);

    .contenedor-archivos {
      border-bottom: solid 2px var(--color-neutro-3);
    }
  }
}
</style>
