<script setup>
// Recuperamos información a partir de la url
const route = useRoute();
const selectedPk = route.query.data;
const type = route.query.type;
const typeDict = {
  Documentos: 'document',
  'Capa geográfica': 'dataLayer',
  'Datos tabulados': 'dataTable',
};
// Recuperamos la información completa del recurso
const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(typeDict[type]);
const resources = computed(() => storeFetched.byResourceType(typeDict[type]));
const editedResource = computed(() => resources.value.find(({ pk }) => pk === selectedPk));
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="editedResource" id="principal" class="contenedor m-b-10 m-y-3">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link to="/catalogo/mis-archivos" aria-label="regresar a mis archivos">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h5 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>
        </div>

        <CatalogoHeaderMetadatos
          :resource="editedResource"
          :title="'Metadatos Opcionales'"
          :exclude-links="false"
        ></CatalogoHeaderMetadatos>

        <h3>Un placeholder</h3>

        <CatalogoBotonesMetadatos
          :key="`3-${selectedPk}-buttons`"
          :title="'MetadatosOpcionales'"
          :pk="selectedPk"
          :tipo="type"
          :resource="editedResource"
        ></CatalogoBotonesMetadatos>
      </main>

      <main v-else>
        <p>...cargando</p>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
