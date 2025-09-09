<script setup>
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { categoriesInSpanish, cleanInput } from '~/utils/consulta';

const config = useRuntimeConfig();
const storeFetched = useFetchedResources2Store();
const storeConsulta = useConsultaStore();
const storeFilters = useFilteredResources();
defineProps({
  titulo: { type: String, default: 'Título' },
  etiquetaElementos: { type: String, default: undefined },
});
const { data } = useAuth();
const isLoggedIn = ref(data.value ? true : false);
const apiCategorias = `${config.public.geonodeApi}/facets/category`;
const resources = computed(() => storeFetched.byResourceType());
const filteredResources = ref([]);
const categoryList = ref([]);
const categorizedResources = ref({});
const selectedCategories = ref([]);
const modalFiltroAvanzado = ref(null);
const isFilterActive = ref(false);
const selectedOwner = computed({
  get: () => storeFilters.filters.owner,
  set: (value) => storeFilters.updateFilter('owner', value),
});
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});

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
function applyAdvancedFilter() {
  isFilterActive.value = true;
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  updateResources(storeFilters.filter());
}

function resetAdvancedFilter() {
  isFilterActive.value = false;
  storeFilters.resetFilters();
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  updateResources(storeFilters.filter());
}
function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  groupResults();
}

watch([inputSearch, selectedOwner, resources], () => {
  updateResources(storeFilters.filter());
});

onMounted(async () => {
  storeFilters.resetAll();
  if (resources.value.length !== 0) {
    updateResources(resources.value);
  }
});
</script>

<template>
  <div class="catalogo-layout">
    <div class="encabeado-catalogo">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <p v-if="!isLoggedIn" class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

        <ClientOnly>
          <SisdaiSelector
            v-if="isLoggedIn"
            v-model="selectedOwner"
            class="m-y-2"
            etiqueta="Buscar en catálogo y tus archivos:"
            instruccional="Selecciona los recursos por permisos"
          >
            <option value="todos">Todos los conjuntos de datos</option>
            <option value="catalogo">Archivos del catálogo</option>
            <option value="misArchivos">Mis Archivos</option>
          </SisdaiSelector>
        </ClientOnly>

        <ClientOnly>
          <div class="flex flex-contenido-centrado m-y-3">
            <form class="campo-busqueda columna-12" @submit.prevent>
              <label for="idunicobusqueda" class="a11y-solo-lectura"> Campo de búsqueda </label>
              <input
                id="input-busqueda-consulta"
                v-model="inputSearch"
                type="search"
                class="campo-busqueda-entrada"
                placeholder="Campo de búsqueda"
              />

              <button
                aria-label="Borrar"
                class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                type="button"
                @click="storeFilters.updateFilter('inputSearch', '')"
              >
                <span aria-hidden="true" class="pictograma-cerrar" />
              </button>

              <button
                aria-label="Buscar"
                class="boton-primario boton-pictograma campo-busqueda-buscar"
                type="button"
              >
                <span class="pictograma-buscar" aria-hidden="true" />
              </button>
            </form>
            <!--             <SisdaiCampoBusqueda
              class="columna-12"
              :catalogo="resources"
              :propiedad-busqueda="'title'"
              :etiqueta="'Usa palabras clave...'"
            /> -->
            <!-- @al-filtrar="filterByInput" -->
            <button
              type="button"
              :class="
                isFilterActive
                  ? 'boton-primario boton-pictograma boton-grande'
                  : 'boton-secundario boton-pictograma boton-grande'
              "
              aria-label="Filtro Avanzado"
              @click="modalFiltroAvanzado.abrirModalBusqueda"
            >
              <span class="pictograma-filtro" aria-hidden="true" />
            </button>
          </div>
        </ClientOnly>
        <UiNumeroElementos :numero="filteredResources.length" :etiqueta="etiquetaElementos" />
      </div>
    </div>

    <div v-for="category in Object.keys(categorizedResources)" :key="category" class="m-y-1">
      <ConsultaElementoCategoria
        :title="categoriesInSpanish[category]"
        :tag="etiquetaElementos"
        :number-elements="categorizedResources[category].length"
        @click="setSelectedCategory(category)"
      />

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
          :resource-type="storeConsulta.resourceType"
        />
      </div>
    </div>
  </div>

  <ConsultaModalBusqueda
    ref="modalFiltroAvanzado"
    @apply-filter="applyAdvancedFilter"
    @reset-filter="resetAdvancedFilter"
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
    z-index: 2;
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
