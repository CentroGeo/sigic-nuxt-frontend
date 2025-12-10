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
const apiCategorias = `${config.public.geonodeApi}/facets/category?page_size=30`;
const filteredResources = ref([]);
const categoriesDict = ref({});
const orderedCategories = ref([]);
const categorizedResources = ref({});
const selectedCategories = ref([]);
const modalFiltroAvanzado = ref(null);
const modalOWSglobal = ref(null);
//https://geonode.dev.geoint.mx/gs/ows
const sigicOWS = `${config.public.baseURL}/catalogue/csw`;
const isFilterActive = ref(false);

async function fetchTotalByCategory(category) {
  const preParams = params.value;
  preParams['filter{category.identifier.in}'] = category;
  preParams['filter{complete_metadata}'] = 'true';
  const url = buildUrl(`${config.public.geonodeApi}/sigic-resources`, preParams);
  const request = await gnoxyFetch(url);
  const res = await request.json();
  return res.total;
}

async function buildCategoriesDict() {
  categoriesDict.value = {};
  orderedCategories.value = [];
  // Esta parte es para obtener todas las categorias
  if (storeFilters.filters.categories.length === 0) {
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
  if (Object.keys(categoriesDict.value).length > 0) {
    orderedCategories.value = Object.keys(categoriesDict.value).sort((a, b) =>
      categoriesInSpanish[a].localeCompare(categoriesInSpanish[b])
    );
  } else {
    orderedCategories.value = [];
  }
}

async function callResources(categoria) {
  const total = categoriesDict.value[categoria].total;
  const count = categorizedResources.value[categoria]
    ? categorizedResources.value[categoria].length
    : 0;
  if (total > count && selectedCategories.value.includes(categoria)) {
    categoriesDict.value[categoria].isLoading = true;
    const preParams = params.value;
    preParams['filter{category.identifier.in}'] = categoriesValues[categoria];
    await storeResources.fillByCategory(
      storeConsulta.resourceType,
      categoriesDict.value[categoria].page,
      preParams
    );
    categoriesDict.value[categoria].page += 1;
    categoriesDict.value[categoria].isLoading = false;
  }
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
  if (categoriesDict.value[category].isLoading === false) {
    await callResources(category);
    updateResources(resources.value);
  }
}

async function applyAdvancedFilter() {
  isFilterActive.value = true;
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  storeFilters.buildQueryParams();
}

function resetSearch() {
  storeFilters.updateFilter('inputSearch', '');
  storeFilters.buildQueryParams();
}

function resetAdvancedFilter() {
  isFilterActive.value = false;
  storeFilters.resetFilters();
  storeFilters.buildQueryParams();
  modalFiltroAvanzado.value.cerrarModalBusqueda();
}

watch(selectedOwner, () => {
  storeFilters.buildQueryParams();
});

watch(params, async () => {
  isLoading.value = true;
  storeResources.resetByType();
  totalResources.value = 0;
  selectedCategories.value = [];
  categorizedResources.value = {};
  await buildCategoriesDict();
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
    <div class="encabezado-catalogo">
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
            <option value="catalogo">Archivos del Catálogo</option>
            <option v-if="storeConsulta.resourceType === 'dataLayer'" value="remotos">
              Catálogos Externos
            </option>
            <option value="privados">Mis Archivos</option>
            <option value="todos">Todos los Conjuntos de Datos</option>
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
                @click="resetSearch"
              >
                <span aria-hidden="true" class="pictograma-cerrar" />
              </button>

              <button
                aria-label="Buscar"
                class="boton-primario boton-pictograma campo-busqueda-buscar"
                type="button"
                @click="storeFilters.buildQueryParams"
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
              style="position: relative"
              @click="modalFiltroAvanzado.abrirModalBusqueda"
            >
              <div v-if="isFilterActive" class="circulo"></div>
              <span class="pictograma-filtro" aria-hidden="true" />
            </button>
          </div>
        </ClientOnly>
        <div
          v-if="storeConsulta.resourceType === 'dataLayer'"
          class="flex flex-contenido-centrado"
          style="gap: 0px"
        >
          <button
            type="button"
            class="boton-secundario columna-16 boton-chico flex flex-contenido-centrado"
            aria-label="Enlace Catalogue Service for the Web"
            @click="modalOWSglobal.abrirModalOWS"
          >
            Enlace Catalogue Service for the Web (CSW)
          </button>
          <div class="flex flex-contenido-separado">
            <p class="columna-12" style="font-size: 1rem">
              Conecta un catálogo externo para ver sus datos
            </p>
            <nuxt-link
              class="boton-secundario boton-pictograma boton-grande"
              style="align-self: center"
              to="/catalogo/servicios-remotos/agregar"
            >
              <span aria-hidden="true" class="pictograma-colaborar" />
            </nuxt-link>
          </div>
        </div>
        <UiNumeroElementos :numero="totalResources" :etiqueta="etiquetaElementos" />
      </div>
      <div v-if="isLoading" class="flex flex-contenido-centrado m-t-3">
        <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
      </div>

      <div v-if="orderedCategories.length === 0 && !isLoading">
        <div class="borde-redondeado-16 m-2 fondo-color-informacion texto-color-informacion p-2">
          <p class="nota texto-color-informacion m-2">
            No se encontraron resultados que coincidan con la búsqueda.
          </p>
        </div>
      </div>

      <div v-if="orderedCategories.length > 0 && !isLoading">
        <div v-for="category in orderedCategories" :key="category" class="m-y-1">
          <ConsultaElementoCategoria
            :title="categoriesDict[category]?.inSpanish"
            :tag="etiquetaElementos"
            :number-elements="categoriesDict[category]?.total"
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
          <div
            v-if="categoriesDict[category]?.isLoading && selectedCategories.includes(category)"
            class="flex flex-contenido-centrado"
          >
            <img
              class="color-invertir m-y-2"
              src="/img/loader.gif"
              alt="...Cargando"
              height="40px"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <ConsultaModalBusqueda
    ref="modalFiltroAvanzado"
    @apply-filter="applyAdvancedFilter"
    @reset-filter="resetAdvancedFilter"
  />

  <ConsultaModalOWS
    ref="modalOWSglobal"
    key="modal-ows-global"
    :ows-link="sigicOWS"
    :service="'CSW'"
  />
</template>

<style lang="scss" scoped>
.catalogo-layout {
  height: var(--altura-consulta-esc);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;

  .encabezado-catalogo {
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

.circulo {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: var(--color-informativo-2);
  border-radius: 50%;
  right: -4px;
  top: -4px;
  z-index: 1;
}
</style>
