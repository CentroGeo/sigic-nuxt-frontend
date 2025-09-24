<script setup>
// TODO: Quitar toda la logica para elementos sin categoria
//import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
//import { categoriesInSpanish } from '~/utils/consulta';
import { buildUrl, categoriesInSpanish, resourceTypeGeonode } from '~/utils/consulta';

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const storeResources = useResourcesConsultaStore();
const storeConsulta = useConsultaStore();
const totalResources = computed(() => storeResources.totalByType());
const isLoading = computed(() => storeResources.isLoading);
const nthElement = 1;
//const storeFetched = useFetchedResources2Store();
//const storeFilters = useFilteredResources();
defineProps({
  titulo: { type: String, default: 'Título' },
  etiquetaElementos: { type: String, default: undefined },
});
//const { data } = useAuth();
//const isLoggedIn = ref(data.value ? true : false);
const apiCategorias = `${config.public.geonodeApi}/facets/category`;
const resources = computed(() => storeResources.resourcesByType());
const filteredResources = ref([]);
const categoriesDict = ref({});
const categorizedResources = ref({});
const selectedCategories = ref([]);
//const modalFiltroAvanzado = ref(null);
/* const isFilterActive = ref(false);
const selectedOwner = computed({
  get: () => storeFilters.filters.owner,
  set: (value) => storeFilters.updateFilter('owner', value),
});
const inputSearch = computed({
  get: () => storeFilters.filters.inputSearch,
  set: (value) => storeFilters.updateFilter('inputSearch', cleanInput(value)),
}); */

// TODO: Llevar esta fución a los utils
async function fetchTotalByCategory(category) {
  const queryParams = {
    custom: 'true',
    'filter{resource_type}': resourceTypeGeonode[storeConsulta.resourceType],
    'filter{category.identifier}': category,
  };
  if (storeConsulta.resourceType === 'dataLayer') {
    queryParams['extent_ne'] = '[-1,-1,0,0]';
  }
  if (storeConsulta.resourceType === 'dataTable') {
    queryParams['filter{subtype.in}'] = ['vector', 'remote'];
  }
  if (storeConsulta.resourceType === 'document') {
    queryParams['file_extension'] = ['pdf', 'txt'];
  }
  const url = buildUrl(`${config.public.geonodeApi}/resources`, queryParams);
  const request = await gnoxyFetch(url);
  const res = await request.json();
  return res.total;
}

async function buildCategoriesDict() {
  // Esta parte es para obtener todas las categorias
  const request = await gnoxyFetch(apiCategorias);
  const geonodeCategories = await request.json();
  // Aquí creamos el diccionario de categorías

  categoriesDict.value = {};
  if (!geonodeCategories) {
    categoriesDict.value['Sin Clasificar'] = {
      label: 'Sin Clasificar',
      name: 'sinClasificar',
      inSpanish: categoriesInSpanish['Sin Clasificar'],
      total: totalResources.value,
      page: 1,
      isLoading: false,
    };
  } else {
    const results = await Promise.all(
      geonodeCategories.topics.items.map(async (d) => {
        const totalByCat = await fetchTotalByCategory(d.key);
        categoriesDict.value[d.label] = {
          label: d.label,
          name: d.key,
          inSpanish: categoriesInSpanish[d.label],
          total: totalByCat,
          page: 1,
          isLoading: false,
        };
        return totalByCat;
      })
    );
    const totalWithCategory = results.reduce((a, b) => a + b, 0);
    categoriesDict.value['Sin Clasificar'] = {
      label: 'Sin Clasificar',
      name: 'sinClasificar',
      inSpanish: categoriesInSpanish['Sin Clasificar'],
      total: totalResources.value - totalWithCategory,
      page: 1,
      isLoading: false,
    };
  }
}

async function callResources(categoria) {
  categoriesDict.value[categoria].isLoading = true;
  const total = categoriesDict.value[categoria].total;
  const count = categorizedResources.value[categoria]
    ? categorizedResources.value[categoria].length
    : 0;
  if (total > count) {
    await storeResources.fillByCategory(
      storeConsulta.resourceType,
      categoriesDict.value[categoria].page,
      categoriesDict.value[categoria].name
    );
    categoriesDict.value[categoria].page += 1;
  }
  categoriesDict.value[categoria].isLoading = false;
}
function getNthElements() {
  const nthElementsUuids = [];
  const categoriesList = Object.keys(categorizedResources.value);
  categoriesList.forEach((category) => {
    const nthIndex = categorizedResources.value[category].length - nthElement;
    nthElementsUuids.push(categorizedResources.value[category][nthIndex]['uuid']);
  });
  return nthElementsUuids;
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

// Prueba de consumo de recursos paginado y usando gnoxy
async function fetchNewData(category) {
  await callResources(category);
  updateResources(resources.value);
}
// Eventualmente quitar la siguiente línea
buildCategoriesDict();
watch(totalResources, () => {
  buildCategoriesDict();
});

//const { data: geonodeCategories } = await gno

/*

function applyAdvancedFilter() {
  isFilterActive.value = true;
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  updateResources(storeFilters.filter(storeConsulta.resourceType));
}

function resetAdvancedFilter() {
  isFilterActive.value = false;
  storeFilters.resetFilters();
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  updateResources(storeFilters.filter(storeConsulta.resourceType));
}
function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;
  groupResults();
}

watch([inputSearch, selectedOwner, resources], () => {
  updateResources(storeFilters.filter(storeConsulta.resourceType));
});

onMounted(async () => {
  storeFilters.resetAll();
  if (resources.value.length !== 0) {
    updateResources(resources.value);
  }
});
 */
</script>

<template>
  <div class="catalogo-layout">
    <div class="encabeado-catalogo">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <!--         <p v-if="!isLoggedIn" class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

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
        </ClientOnly> -->
        <UiNumeroElementos :numero="totalResources" :etiqueta="etiquetaElementos" />
      </div>
    </div>
    <div v-if="isLoading">....Cargando</div>
    <div v-else>
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

  <!--   <ConsultaModalBusqueda
    ref="modalFiltroAvanzado"
    @apply-filter="applyAdvancedFilter"
    @reset-filter="resetAdvancedFilter"
  /> -->
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
