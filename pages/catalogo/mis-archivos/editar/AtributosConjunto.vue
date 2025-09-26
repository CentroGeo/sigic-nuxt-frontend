<script setup>
import { fetchByPk } from '~/utils/catalogo';

const storeCatalogo = useCatalogoStore();

// Recuperamos información a partir de la url
const route = useRoute();
const selectedPk = route.query.data;
const type = route.query.type;
const editedResource = ref(undefined);
onMounted(async () => {
  editedResource.value = await fetchByPk(selectedPk);
});
/* const typeDict = {
  Documentos: 'document',
  'Capa geográfica': 'dataLayer',
  'Datos tabulados': 'dataTable',
}; */
// Recuperamos la información completa del recurso
/* const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(typeDict[type]);
const resources = computed(() => storeFetched.byResourceType(typeDict[type]));
const editedResource = computed(() => resources.value.find(({ pk }) => pk === selectedPk)); */
</script>
<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="editedResource" id="atributos-conjunto" class="contenedor m-b-10 m-y-3">
        <div class="flex m-0 contenedor-botones">
          <button
            class="boton-pictograma boton-sin-contenedor-secundario"
            aria-label="Acción a realizar"
            type="button"
          >
            <span class="pictograma-flecha-izquierda" aria-hidden="true" />
          </button>
          <p>Editar</p>
        </div>

        <CatalogoAtributosMeta
          :resource="editedResource"
          :resource-type="type"
          :resource-pk="selectedPk"
        ></CatalogoAtributosMeta>
      </main>
      <main v-else>
        <p>...cargando</p>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style></style>
