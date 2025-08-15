<script setup>
import SisdaiCampoBusqueda from '@centrogeomx/sisdai-componentes/src/componentes/campo-busqueda/SisdaiCampoBusqueda.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const config = useRuntimeConfig();
const storeFetched = useFetchedResources2Store();

const props = defineProps({
  titulo: { type: String, default: 'Título' },
  resourceType: { type: String, required: true },
  etiquetaElementos: { type: String, default: undefined },
});

const resources = computed(() => storeFetched.byResourceType());
const filteredResources = ref([]);
const apiCategorias = `${config.public.geonodeApi}/facets/category`;
const categoryList = ref([]);
const categorizedResources = ref({});
const selectedCategories = ref([]);
const isFilterActive = ref(false);
const modalFiltroAvanzado = ref(null);

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
  groupResults();
}

function applyAdvancedFilters(resources) {
  isFilterActive.value = true;
  filteredResources.value = resources;
  groupResults();
}
function resetAdvancedFilter(resources) {
  isFilterActive.value = false;
  filteredResources.value = resources;
  groupResults();
}

onMounted(() => {
  if (resources.value.length !== 0) {
    filteredResources.value = resources.value;
    groupResults();
  }
});

watch(resources, (nv) => {
  filteredResources.value = nv;
  groupResults();
});

const { data } = useAuth();
const isLoggedIn = ref(data.value ? true : false);
const userEmail = ref(data.value?.user.email);
//console.log('auth data', data.value);

const selectorAuthor = ref('todos');

function filterByAuthor() {
  if (selectorAuthor.value === 'todos') {
    filteredResources.value = resources.value;
  } else if (selectorAuthor.value === 'catalogo') {
    filteredResources.value = resources.value.filter(
      (resource) => resource.owner.email !== userEmail.value
    );
  } else {
    filteredResources.value = resources.value.filter(
      (resource) => resource.owner.email === userEmail.value
    );
  }
  groupResults();
}

watch(selectorAuthor, () => {
  filterByAuthor();
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
            v-model="selectorAuthor"
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
            <SisdaiCampoBusqueda
              class="columna-12"
              :catalogo="resources"
              :propiedad-busqueda="'title'"
              :etiqueta="'Usa palabras clave...'"
              @al-filtrar="filterByInput"
            />
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
        :title="category"
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
          :resource-type="resourceType"
        />
      </div>
    </div>
  </div>

  <ConsultaModalBusqueda
    ref="modalFiltroAvanzado"
    :resource-type="props.resourceType"
    :categories="categoryList"
    @apply-filter="(results) => applyAdvancedFilters(results)"
    @reset-filter="(results) => resetAdvancedFilter(results)"
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
