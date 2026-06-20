<script setup>
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

// ── Modo mapas ────────────────────────────────────────────────────────────
// En /consulta/mapas este catálogo muestra la lista de mapas (sigic-maps) en
// lugar del catálogo de recursos GeoNode. La selección se comparte via store.
const route = useRoute();
const mapasStore = useMapasStore();
const esRutaMapas = computed(() => route.path.startsWith('/consulta/mapas'));
const cargandoMapas = ref(false);
const busquedaMapas = ref('');
const filtroMapas = ref('todos'); // todos | publicos | propios
const modalCompartir = ref(null);

function esMapaPropio(m) {
  const ownerUsername = m.owner?.username;
  if (!ownerUsername || !data.value) return false;
  return ownerUsername === data.value.user?.email || ownerUsername === data.value.user?.name;
}

function abrirCompartir() {
  modalCompartir.value?.abrir();
}

const mapasFiltrados = computed(() => {
  const termino = busquedaMapas.value.trim().toLowerCase();
  return mapasStore.maps.filter((m) => {
    if (filtroMapas.value === 'publicos' && m.is_public === false) return false;
    if (filtroMapas.value === 'propios' && !esMapaPropio(m)) return false;
    if (termino && !(m.name || '').toLowerCase().includes(termino)) return false;
    return true;
  });
});

async function cargarListaMapas() {
  cargandoMapas.value = true;
  await mapasStore.cargarMapas({ page: 1, page_size: 50 });
  cargandoMapas.value = false;
}

async function seleccionarMapa(id) {
  if (mapasStore.activeMap?.id === id) return;
  await mapasStore.cargarMapa(id);
}

function limpiarBusquedaMapas() {
  busquedaMapas.value = '';
}

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
            wasFetchSuccesful: true,
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
            wasFetchSuccesful: true,
          };
        }
        return totalByCat;
      })
    );
    totalResources.value = results.reduce((a, b) => a + b, 0);
  }
  if (Object.keys(categoriesDict.value).length > 0) {
    orderedCategories.value = Object.keys(categoriesDict.value).sort((a, b) =>
      (categoriesInSpanish[a] ?? a).localeCompare(categoriesInSpanish[b] ?? b)
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
    const status = await storeResources.fillByCategory(
      storeConsulta.resourceType,
      categoriesDict.value[categoria].page,
      preParams
    );
    if (status === true) {
      categoriesDict.value[categoria].page += 1;
    }
    categoriesDict.value[categoria]['wasFetchSuccesful'] = status;
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

function activateAdvancedFilter() {
  let activeFilters = 0;
  if (
    Object.keys(params.value).includes('filter{category.identifier.in}') &&
    params.value['filter{category.identifier.in}'].length > 0
  ) {
    activeFilters += 1;
  }
  if (
    Object.keys(params.value).includes('filter{year}') &&
    params.value['filter{year}'].length > 0
  ) {
    activeFilters += 1;
  }
  if (
    Object.keys(params.value).includes('filter{institution}') &&
    params.value['filter{institution}'].length > 0
  ) {
    activeFilters += 1;
  }
  if (
    Object.keys(params.value).includes('filter{keywords.name.in}') &&
    params.value['filter{keywords.name.in}'].length > 0
  ) {
    activeFilters += 1;
  }
  if (activeFilters > 0) {
    isFilterActive.value = true;
  } else {
    isFilterActive.value = false;
  }
}

async function applyAdvancedFilter() {
  modalFiltroAvanzado.value.cerrarModalBusqueda();
  storeFilters.buildQueryParams();
  activateAdvancedFilter();
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
  if (esRutaMapas.value) return;
  storeFilters.buildQueryParams();
});

watch(params, async () => {
  if (esRutaMapas.value) return;
  isLoading.value = true;
  storeResources.resetByType();
  totalResources.value = 0;
  selectedCategories.value = [];
  categorizedResources.value = {};
  await buildCategoriesDict();
  isLoading.value = false;
});

onMounted(async () => {
  if (esRutaMapas.value) {
    await cargarListaMapas();
    return;
  }
  storeFilters.resetAll();
  storeFilters.buildQueryParams();
  if (resources.value.length !== 0) {
    updateResources(resources.value);
  }
});
</script>

<template>
  <div class="catalogo-layout">
    <!-- Modo mapas: lista de mapas (sigic-maps) -->
    <div v-if="esRutaMapas" class="explorador-mapas">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <!-- Selector de búsqueda -->
        <label for="selector-mapas">Filtrar mapas</label>
        <select id="selector-mapas" v-model="filtroMapas" name="selector-mapas" class="m-b-2">
          <option value="todos">Todos los mapas</option>
          <option value="publicos">Mapas públicos</option>
          <option v-if="isLoggedIn" value="propios">Mis mapas</option>
        </select>

        <!-- Campo de búsqueda -->
        <ClientOnly>
          <form class="campo-busqueda" @submit.prevent>
            <label for="input-busqueda-mapas" class="a11y-solo-lectura">Campo de búsqueda</label>
            <input
              id="input-busqueda-mapas"
              v-model="busquedaMapas"
              type="search"
              class="campo-busqueda-entrada"
              placeholder="Buscar mapas"
            />
            <button
              aria-label="Borrar"
              class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
              type="button"
              @click="limpiarBusquedaMapas"
            >
              <span aria-hidden="true" class="pictograma-cerrar" />
            </button>
            <button
              v-globo-informacion:derecha="'Buscar'"
              aria-label="Buscar"
              class="boton-primario boton-pictograma campo-busqueda-buscar"
              type="button"
            >
              <span class="pictograma-buscar" aria-hidden="true" />
            </button>
          </form>
        </ClientOnly>

        <UiNumeroElementos
          :numero="mapasFiltrados.length"
          :etiqueta="etiquetaElementos || 'Mapas'"
        />
      </div>

      <p v-if="cargandoMapas" class="texto-secundario p-3 m-0">Cargando…</p>

      <ul v-else-if="mapasFiltrados.length" class="lista">
        <li
          v-for="m in mapasFiltrados"
          :key="m.id"
          class="item p-2"
          :class="{ activo: mapasStore.activeMap?.id === m.id }"
          @click="seleccionarMapa(m.id)"
        >
          <div class="item-titulo">{{ m.name }}</div>
          <div class="item-meta texto-secundario">
            <span>{{ m.owner?.username || 'Anónimo' }}</span>
            <span v-if="m.is_public === false" class="chip-privado">
              <i class="fa-solid fa-lock" aria-hidden="true"></i> Privado
            </span>
            <button class="boton-secundario boton-chico" type="button" @click="abrirCompartir">
              <i class="fa-solid fa-share-nodes" aria-hidden="true"></i> Compartir
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="texto-secundario p-3 m-0">No se encontraron mapas.</p>
    </div>

    <!-- Modo catálogo de recursos GeoNode -->
    <div v-else class="encabezado-catalogo">
      <p class="h4 fondo-color-acento p-3 m-0">{{ titulo }}</p>

      <div class="m-x-2 m-y-1">
        <p v-if="!isLoggedIn" class="m-0">Explora conjuntos de datos abiertos nacionales.</p>

        <!--Selector de propiedad-->
        <div v-if="isLoggedIn">
          <label for="selector-origen">Buscar en catálogo y tus archivos</label>
          <select
            v-model="selectedOwner"
            name="selector-origen"
            class="m-b-2"
            :disabled="isLoading"
          >
            <option value="catalogo">Archivos del Catálogo</option>
            <option v-if="storeConsulta.resourceType === 'dataLayer'" value="remotos">
              Catálogos Externos
            </option>
            <option value="privados">Mis Archivos</option>
            <option value="todos">Todos los Conjuntos de Datos</option>
          </select>
        </div>

        <!--Búsqueda-->
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
                :disabled="isLoading"
                @keyup.enter="storeFilters.buildQueryParams(storeConsulta.resourceType)"
              />

              <button
                aria-label="Borrar"
                :disabled="isLoading"
                class="boton-pictograma boton-sin-contenedor-secundario campo-busqueda-borrar"
                type="button"
                @click="resetSearch"
              >
                <span aria-hidden="true" class="pictograma-cerrar" />
              </button>

              <button
                v-globo-informacion:derecha="'Buscar'"
                aria-label="Buscar"
                :disabled="isLoading"
                class="boton-primario boton-pictograma campo-busqueda-buscar"
                type="button"
                @click="storeFilters.buildQueryParams(storeConsulta.resourceType)"
              >
                <span class="pictograma-buscar" aria-hidden="true" />
              </button>
            </form>

            <button
              v-globo-informacion:derecha="'Búsqueda avanzada'"
              type="button"
              :disabled="isLoading"
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

        <!--CSW y Catálogos externos-->
        <div
          v-if="storeConsulta.resourceType === 'dataLayer'"
          class="flex flex-contenido-centrado"
          style="gap: 0px"
        >
          <button
            v-globo-informacion:derecha="'Enlace CSW'"
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
              <span
                v-globo-informacion:derecha="'Conectar Catálogo Externo'"
                aria-hidden="true"
                class="pictograma-colaborar"
              />
            </nuxt-link>
          </div>
        </div>
        <UiNumeroElementos :numero="totalResources" :etiqueta="etiquetaElementos" />
      </div>
      <!--Spinner general-->
      <div v-if="isLoading" class="flex flex-contenido-centrado m-t-3">
        <img
          class="color-invertir"
          :src="`${$config.app.baseURL}img/loader.gif`"
          alt="...Cargando"
          height="120px"
        />
      </div>

      <!--Si no hay resultados que coincidan con la busqueda-->
      <div v-if="orderedCategories.length === 0 && !isLoading">
        <div class="borde-redondeado-16 m-2 fondo-color-informacion texto-color-informacion p-2">
          <p class="nota texto-color-informacion m-2">
            No se encontraron resultados que coincidan con la búsqueda.
          </p>
        </div>
      </div>

      <div v-if="orderedCategories.length > 0 && !isLoading">
        <div v-for="category in orderedCategories" :key="category" class="m-y-1">
          <!--Tarjetas de categoría-->
          <ConsultaElementoCategoria
            :title="categoriesDict[category]?.inSpanish"
            :tag="etiquetaElementos"
            :number-elements="categoriesDict[category]?.total"
            @click="setSelectedCategory(category)"
          />

          <!--Tarjetas de recursos-->
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

          <!--Boton de reintentar-->
          <div
            v-if="
              !categoriesDict[category]?.isLoading &&
              categoriesDict[category]?.wasFetchSuccesful === false
            "
            class="flex flex-contenido-centrado m-y-1"
          >
            <button
              type="button"
              class="boton-secundario boton-chico flex"
              style="gap: 8px"
              aria-label="Reintentar"
              @click="fetchNewData(category)"
            >
              <span aria-hidden="true" class="pictograma-restablecer" /> Reintentar
            </button>
          </div>

          <!--Spinner por categoría-->
          <div
            v-if="categoriesDict[category]?.isLoading && selectedCategories.includes(category)"
            class="flex flex-contenido-centrado"
          >
            <img
              class="color-invertir m-y-2"
              :src="`${$config.app.baseURL}img/loader.gif`"
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
  <MapasModalCompartir ref="modalCompartir" :mapa="mapasStore.activeMap" />
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

// ── Modo mapas ──────────────────────────────────────────────────────────────
.explorador-mapas {
  .encabezado {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-neutro-1);
  }

  .lista {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .item {
    cursor: pointer;
    border-bottom: 1px solid var(--color-neutro-1);
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--fondo-acento);
    }

    &.activo {
      background-color: var(--color-secundario-2);
      color: #000;

      .item-titulo,
      .item-meta,
      .texto-secundario {
        color: #000;
      }
    }
  }

  .item-titulo {
    font-weight: 600;
  }

  .item-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.85rem;
    margin-top: 2px;
  }

  .chip-privado {
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 0 6px;
    border-radius: 8px;
    font-size: 0.7rem;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}
</style>
