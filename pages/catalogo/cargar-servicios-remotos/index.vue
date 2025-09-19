<script setup>
import { resourceTypeDic } from '~/utils/consulta';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeFilters = useFilteredResources();
const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(resourceTypeDic.dataLayer);
storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

const recursos = computed(() => storeFetched.all);
const filteredResources = ref([]);

function updateResources(nuevosRecursos) {
  filteredResources.value = nuevosRecursos;

  if (filteredResources.value.length > 0) {
    filteredResources.value = filteredResources.value.filter(
      (resource) => resource.sourcetype === 'REMOTE'
    );
    //console.log('filteredResources.value.length', filteredResources.value.length);
    // si hay recursos remotos
    if (filteredResources.value.length !== 0) {
      navigateTo({
        path: '/catalogo/cargar-servicios-remotos/agregar',
      });
    } else {
      navigateTo({
        path: '/catalogo/cargar-servicios-remotos/cargados',
      });
    }
  }
}

watch([recursos], () => {
  updateResources(storeFilters.filter('all'));
});

onMounted(() => {
  storeFilters.resetAll();
  if (recursos.value.length !== 0) {
    updateResources(recursos.value);
  }
});
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
        <p>...cargando</p>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
