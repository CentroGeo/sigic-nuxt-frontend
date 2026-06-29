<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
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
const storeSelected = useSelectedResources2Store();
const storeCatalogo = useCatalogoStore();

// Estados reactivos para la eliminación
const resourceToDelete = ref(null);
const modalEliminar = ref(null);
const isBeingDeleted = ref(false);
const wasDeletionSuccesful = ref(null);

defineProps({
  titulo: { type: String, default: 'Título' },
  etiquetaElementos: { type: String, default: undefined },
});
const totalResources = ref(0);
const isLoading = ref(true);
const resources = computed(() => storeResources.resourcesByType());
const params = computed(() => storeFilters.filters.queryParams);
const categorizedResources = computed(() => {
  const result = {};
  resources.value.forEach((r) => {
    const title = r.category?.gn_description ?? 'Sin Clasificar';
    if (!result[title]) result[title] = [];
    result[title].push(r);
  });
  return result;
});
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
const categoriesDict = ref({});
const orderedCategories = ref([]);
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

async function setSelectedCategory(categoria) {
  if (selectedCategories.value.includes(categoria)) {
    selectedCategories.value = selectedCategories.value.filter((c) => c !== categoria);
  } else {
    selectedCategories.value.push(categoria);
  }

  if (!categoriesDict.value[categoria].isLoading) {
    await callResources(categoria);
  }
}

async function fetchNewData(category) {
  if (categoriesDict.value[category].isLoading === false) {
    await callResources(category);
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

function abrirConfirmarEliminar(resource) {
  resourceToDelete.value = resource;
  wasDeletionSuccesful.value = null;
  isBeingDeleted.value = false;
  modalEliminar.value?.abrirModal();
}

function cancelarEliminar() {
  modalEliminar.value?.cerrarModal();
  resourceToDelete.value = null;
}

// Lógica de borrado en base de datos local (vía endpoint proxy)
async function borrarLocal(pk) {
  const token = data.value?.accessToken;
  try {
    const response = await $fetch('/api/delete-resource', {
      method: 'DELETE',
      headers: { token: token, pk: pk },
    });
    return !!response;
  } catch (error) {
    console.error('Error al borrar localmente:', error);
    return false;
  }
}
// Obtener ID del Harvester para desvincular capas remotas
async function getHarvesterId(urlService) {
  const userPk = storeCatalogo.userInfo.pk;
  const url = `${config.public.geonodeApi}/services/?url=${urlService}&owner_id=${userPk}`;
  const requestServices = await gnoxyFetch(url);
  if (!requestServices.ok) return null;
  const resServices = await requestServices.json();
  return resServices.results[0]?.['harvester_id'] || null;
}

// Desvinculación de capa remota en harvester externo
async function borrarRemoto(resource) {
  const token = data.value?.accessToken;
  const remoteAlternate = resource.alternate;
  const linkObject = resource.links?.find((link) => link.link_type === 'OGC:WMS');
  if (!linkObject) return true;

  const serviceLink = linkObject.url.replace('https://', '').replace('http://', '').split('/')[0];
  const harvesterIdentifier = await getHarvesterId(serviceLink);
  if (!harvesterIdentifier) return true;

  const requestBody = [{ unique_identifier: remoteAlternate, should_be_harvested: false }];

  try {
    const updateHarvestables = await $fetch('/api/importar-externo', {
      method: 'POST',
      headers: { token: token },
      body: { harvesterID: harvesterIdentifier, resources: requestBody },
    });
    if (updateHarvestables) {
      const updateHarvesterStatus = await $fetch('/api/actualizar-externo', {
        method: 'POST',
        headers: { token: token },
        body: { id: harvesterIdentifier, status: 'harvesting-resources' },
      });
      return !!updateHarvesterStatus;
    }
    return false;
  } catch (error) {
    console.error('Error al borrar externamente:', error);
    return false;
  }
}

// Flujo de ejecución tras confirmar en la modal
async function ejecutarEliminar() {
  if (!resourceToDelete.value) return;
  isBeingDeleted.value = true;

  let success = false;
  if (resourceToDelete.value.sourcetype === 'REMOTE') {
    const isRemoteDeleted = await borrarRemoto(resourceToDelete.value);
    if (isRemoteDeleted) {
      success = await borrarLocal(resourceToDelete.value.pk);
    }
  } else {
    success = await borrarLocal(resourceToDelete.value.pk);
  }

  isBeingDeleted.value = false;
  wasDeletionSuccesful.value = success;

  if (success) {
    const type = storeConsulta.resourceType;

    // Remueve el recurso de los stores y listas de visualización locales
    storeResources.resources[type] = storeResources.resources[type].filter(
      (r) => r.pk !== resourceToDelete.value.pk
    );

    totalResources.value = Math.max(0, totalResources.value - 1);

    // Actualiza el conteo de la categoría y la excluye si ya no contiene elementos
    const categoryName = resourceToDelete.value.category?.gn_description || 'Sin Clasificar';
    if (categoriesDict.value[categoryName]) {
      categoriesDict.value[categoryName].total = Math.max(
        0,
        categoriesDict.value[categoryName].total - 1
      );

      if (categoriesDict.value[categoryName].total === 0) {
        orderedCategories.value = orderedCategories.value.filter((c) => c !== categoryName);
      }
    }

    if (storeSelected.pks.includes(String(resourceToDelete.value.pk))) {
      storeSelected.removeByPk(String(resourceToDelete.value.pk));
    }

    setTimeout(() => {
      modalEliminar.value?.cerrarModal();
      resourceToDelete.value = null;
    }, 2000);
  }
}
watch(selectedOwner, () => {
  storeFilters.buildQueryParams();
});

watch(categorizedResources, () => {
  storeResources.setNthElements(storeConsulta.resourceType, getNthElements());
});

watch(params, async () => {
  isLoading.value = true;
  storeResources.resetByType();
  totalResources.value = 0;
  selectedCategories.value = [];
  await buildCategoriesDict();
  isLoading.value = false;
});

onMounted(async () => {
  storeFilters.resetAll();
  storeFilters.buildQueryParams();
});
</script>

<template>
  <div class="catalogo-layout">
    <div class="encabezado-catalogo">
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
              @delete="abrirConfirmarEliminar"
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

  <ClientOnly>
    <SisdaiModal ref="modalEliminar">
      <template #encabezado>
        <h2 v-if="wasDeletionSuccesful === null || isBeingDeleted">
          ¿Deseas eliminar este recurso?
        </h2>
        <p v-else></p>
      </template>
      <template #cuerpo>
        <p v-if="wasDeletionSuccesful === null || isBeingDeleted" class="m-b-2">
          <span v-if="resourceToDelete?.is_published">
            El recurso <strong style="font-weight: bold">{{ resourceToDelete?.title }}</strong> está
            publicado en el catálogo. Al eliminarlo, se borrará permanentemente del servidor y no
            será posible recuperarlo.
          </span>
          <span v-else>
            El recurso <strong style="font-weight: bold">{{ resourceToDelete?.title }}</strong> será
            eliminado permanentemente del servidor y no será posible recuperarlo.
          </span>
        </p>

        <!-- Botones de Confirmar/Cancelar -->
        <div
          v-if="wasDeletionSuccesful === null || isBeingDeleted"
          class="flex m-y-2 flex-contenido-centrado"
        >
          <div class="contenedor flex flex-contenido-centrado">
            <button
              type="button"
              class="boton-secundario"
              :disabled="isBeingDeleted"
              @click="cancelarEliminar"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="boton-primario"
              :disabled="isBeingDeleted"
              @click="ejecutarEliminar"
            >
              Eliminar
            </button>
          </div>
          <div v-if="isBeingDeleted" class="columna-3 color-invertir">
            <img
              :src="`${config.app.baseURL}img/loader.gif`"
              class="color-invertir"
              alt="...Procesando"
            />
          </div>
        </div>

        <!-- Alerta de éxito -->
        <div v-if="wasDeletionSuccesful === true && !isBeingDeleted" class="flex" style="gap: 0px">
          <p
            class="columna-14 texto-color-confirmacion fondo-color-confirmacion borde borde-color-confirmacion p-2 borde-redondeado-8"
          >
            <span class="pictograma-aprobado" /> El recurso fue eliminado con éxito del servidor.
          </p>
        </div>

        <!-- Alerta de error -->
        <div v-if="wasDeletionSuccesful === false && !isBeingDeleted" class="flex" style="gap: 0px">
          <p
            class="columna-14 texto-color-error fondo-color-error borde borde-color-error p-2 borde-redondeado-8"
          >
            <span class="pictograma-alerta" /> No pudimos eliminar {{ resourceToDelete?.title }}.
            Revisa tu conexión e intentalo de nuevo más tarde.
          </p>
          <div class="columna-14 flex flex-contenido-final">
            <button class="boton-primario boton-chico" @click="cancelarEliminar">Regresar</button>
          </div>
        </div>
      </template>
    </SisdaiModal>
  </ClientOnly>
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
