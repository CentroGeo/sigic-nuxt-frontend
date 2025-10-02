<script setup>
// TODO: Quitar toda la logica para elementos sin categoria
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import {
  buildUrl,
  categoriesInSpanish,
  categoriesNames,
  categoriesValues,
  cleanInput,
} from '~/utils/consulta';

const config = useRuntimeConfig();
const storeResources = useResourcesConsultaStore();
const storeConsulta = useConsultaStore();
const storeFilters = useFilteredResources();
const { gnoxyFetch } = useGnoxyUrl();
const { data } = useAuth();

defineProps({
  titulo: { type: String, default: 'Título' },
  etiquetaElementos: { type: String, default: undefined },
});
const totalResources = ref(0);
const isLoading = ref(true);
const resources = computed(() => storeResources.resourcesByType());
const params = computed(() => storeFilters.filters.queryParams);
const selectedOwner = computed({
  get: () => storeFilters.filters.owner,
  set: (value) => storeFilters.updateFilter('owner', value),
});
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
});
const nthElement = 1;
const isLoggedIn = ref(data.value ? true : false);
const apiCategorias = `${config.public.geonodeApi}/facets/category`;
const filteredResources = ref([]);
const categoriesDict = ref({});
const categorizedResources = ref({});
const selectedCategories = ref([]);
const modalFiltroAvanzado = ref(null);
const isFilterActive = ref(false);

async function fetchTotalByCategory(category) {
  const preParams = params.value;
  preParams['filter{category.identifier.in}'] = category;
  const url = buildUrl(`${config.public.geonodeApi}/resources`, preParams);
  const request = await gnoxyFetch(url.toString());
  const res = await request.json();
  return res.total;
}

async function buildCategoriesDict() {
  categoriesDict.value = {};
  // Esta parte es para obtener todas las categorias
  if (!isFilterActive.value) {
    const request = await gnoxyFetch(apiCategorias);
    const geonodeCategories = await request.json();
    const results = await Promise.all(
      geonodeCategories.topics.items.map(async (d) => {
        const totalByCat = await fetchTotalByCategory(d.key);
        if (totalByCat !== 0) {
          categoriesDict.value[d.label] = {
            label: d.label,
            name: d.key,
            inSpanish: categoriesInSpanish[d.label],
            total: totalByCat,
            page: 1,
            isLoading: false,
          };
        }
        return totalByCat;
      })
    );
    totalResources.value = results.reduce((a, b) => a + b, 0);
  } else {
    const geonodeCategories = storeFilters.filters.categories;
    const results = await Promise.all(
      geonodeCategories.map(async (d) => {
        const totalByCat = await fetchTotalByCategory(d);
        if (totalByCat !== 0) {
          categoriesDict.value[categoriesNames[d]] = {
            label: categoriesNames[d],
            name: d,
            inSpanish: categoriesInSpanish[categoriesNames[d]],
            total: totalByCat,
            page: 1,
            isLoading: false,
          };
        }
        return totalByCat;
      })
    );
    totalResources.value = results.reduce((a, b) => a + b, 0);
  }
}

async function callResources(categoria) {
  categoriesDict.value[categoria].isLoading = true;
  const total = categoriesDict.value[categoria].total;
  const count = categorizedResources.value[categoria]
    ? categorizedResources.value[categoria].length
    : 0;
  if (total > count) {
    const preParams = params.value;
    preParams['filter{category.identifier.in}'] = categoriesValues[categoria];
    await storeResources.fillByCategory(
      storeConsulta.resourceType,
      categoriesDict.value[categoria].page,
      preParams
    );
    categoriesDict.value[categoria].page += 1;
  }
  categoriesDict.value[categoria].isLoading = false;
}

function getNthElements() {
  const nthElementsPks = [];
  const categoriesList = Object.keys(categorizedResources.value);
  categoriesList.forEach((category) => {
    const nthIndex = categorizedResources.value[category].length - nthElement;
    nthElementsPks.push(categorizedResources.value[category][nthIndex]['pk']);
  });
  return nthElementsPks;
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
      if (Object.keys(categorizedResources.value).includes('Sin Clasificar')) {
        categorizedResources.value['Sin Clasificar'].push(r);
      } else {
        categorizedResources.value['Sin Clasificar'] = [];
        categorizedResources.value['Sin Clasificar'].push(r);
      }
    }
  });
  storeResources.setNthElements(storeConsulta.resourceType, getNthElements());
}

function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  groupResults();
}

async function setSelectedCategory(categoria) {
  if (selectedCategories.value.includes(categoria)) {
    selectedCategories.value = selectedCategories.value.filter((c) => c !== categoria);
  } else {
    selectedCategories.value.push(categoria);
  }
  // Se agrega este if para que no se dispare la misma petición más de una vez
  if (!categoriesDict.value[categoria].isLoading) {
    await callResources(categoria);
    updateResources(resources.value);
  }
}

async function fetchNewData(category) {
  await callResources(category);
  updateResources(resources.value);
}

async function applyAdvancedFilter() {
  isFilterActive.value = true;
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  storeFilters.buildQueryParams();
}

function resetAdvancedFilter() {
  isFilterActive.value = false;
  storeFilters.resetFilters();
  storeFilters.buildQueryParams();
  modalFiltroAvanzado.value.cerrarModalBusqueda();
}
/*
watch([inputSearch, selectedOwner, resources], () => {
  storeFilters.buildQueryParams();
});*/

watch(params, async () => {
  isLoading.value = true;
  storeResources.resetByType();
  const url = buildUrl(`${config.public.geonodeApi}/resources`, params.value);
  const request = await gnoxyFetch(url.toString());
  const res = await request.json();
  filteredResources.value = res.resources;
  buildCategoriesDict();
  isLoading.value = false;
});

onMounted(async () => {
  storeFilters.resetAll();
  storeFilters.buildQueryParams();
  if (resources.value.length !== 0) {
    updateResources(resources.value);
  }
});
</script>

<template>
  <div class="catalogo-layout">
    <div class="encabeado-catalogo">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>
      <div v-if="isLoading">....Cargando</div>
      <div v-else>
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
          <UiNumeroElementos :numero="totalResources" :etiqueta="etiquetaElementos" />
        </div>
        <div v-for="category in Object.keys(categoriesDict)" :key="category" class="m-y-1">
          <ConsultaElementoCategoria
            :title="categoriesDict[category].inSpanish"
            :tag="etiquetaElementos"
            :number-elements="categoriesDict[category].total"
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
              @trigger-fetch="fetchNewData"
            />
          </div>
          <div v-if="categoriesDict[category].isLoading">....Cargando</div>
        </div>
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
  position: relative;

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
