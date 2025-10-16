<script setup>
import { resourceTypeDic, resourceTypeGeonode } from '~/utils/consulta';
import SelectedLayer from '~/utils/consulta/SelectedLayer';
import SelectedResource from '~/utils/consulta/SelectedResource';

const storeResources = useResourcesCatalogoStore();
const storeCatalogo = useCatalogoStore();
const storeSelected = useSelectedResources2Store();
function buildQueryParams(resourceType) {
  const queryParams = {};
  queryParams['filter{resource_type}'] = resourceTypeGeonode[resourceType];
  if (resourceType === 'dataLayer') {
    queryParams['filter{has_geometry}'] = 'true';
  }
  if (resourceType === 'dataTable') {
    queryParams['filter{subtype.in}'] = ['vector', 'remote'];
  }
  if (resourceType === 'document') {
    queryParams['filter{extension}'] = ['pdf', 'txt'];
  }
  return queryParams;
}
storeResources.getTotalResources(resourceTypeDic.dataLayer, buildQueryParams('dataLayer'));
storeResources.getTotalResources(resourceTypeDic.dataTable, buildQueryParams('dataTable'));
storeResources.getTotalResources(resourceTypeDic.document, buildQueryParams('document'));

const types = ['dataLayer', 'dataTable', 'document'];
const resourcesDict = computed(() => ({
  dataLayer: {
    title: 'Capas Geográficas',
    total: storeResources.totalByType('dataLayer'),
    latest: storeResources.latestByType('dataLayer'),
    to: '/catalogo/explorar/capas',
    img: '/img/thumbnail-capas.png',
    keyword: 'capas',
    consultaTo: '/consulta/capas',
    consultaLabel: 'Ver Capa en el Visualizador',
  },
  dataTable: {
    title: 'Datos Tabulados',
    total: storeResources.totalByType('dataTable'),
    latest: storeResources.latestByType('dataTable'),
    to: '/catalogo/explorar/tablas',
    img: '/img/thumbnail-tablas.png',
    keyword: 'datos tabulados',
    consultaTo: '/consulta/tablas',
    consultaLabel: 'Ver Archivo en el Visualizador',
  },
  document: {
    title: 'Documentos',
    total: storeResources.totalByType('document'),
    latest: storeResources.latestByType('document'),
    to: '/catalogo/explorar/documentos',
    img: '/img/thumbnail-docs.png',
    keyword: 'documentos',
    consultaTo: '/consulta/documentos',
    consultaLabel: 'Ver Documento en el Visualizador',
  },
}));
async function updateSelection(type) {
  const currentPk = resourcesDict.value[type].latest.pk;
  if (type === 'dataTable' || type === 'document') {
    storeSelected.add(new SelectedResource({ pk: currentPk }), type);
  } else {
    storeSelected.add(new SelectedLayer({ pk: currentPk }), type);
  }
  nextTick(async () => {
    await navigateTo(resourcesDict.value[type].consultaTo);
  });
}
</script>

<template>
  <div>
    <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
      <template #catalogo>
        <CatalogoListaMenuLateral />
      </template>

      <template #visualizador>
        <main id="principal" class="contenedor m-b-10 p-t-3">
          <h2>Explora</h2>
          <div class="flex">
            <div v-for="type in types" :key="`explora-${type}`" class="columna-5">
              <nuxt-link class="tarjeta tarjeta-hipervinculo-interno" :to="resourcesDict[type].to">
                <img class="tarjeta-imagen" :src="resourcesDict[type].img" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">{{ resourcesDict[type].title }}</p>
                  <p class="tarjeta-etiqueta">
                    {{
                      !resourcesDict[type].total
                        ? '...cargando'
                        : resourcesDict[type].total + ' capas'
                    }}
                  </p>
                </div>
              </nuxt-link>
            </div>
          </div>

          <h2>Lo más reciente</h2>
          <div class="flex">
            <div v-for="type in types" :key="`reciente-${type}`" class="columna-5">
              <div class="tarjeta">
                <img
                  v-if="resourcesDict[type].latest"
                  class="tarjeta-imagen"
                  :src="resourcesDict[type].latest.thumbnail_url"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">{{ resourcesDict[type].title }}</p>
                  <p v-if="!resourcesDict[type].latest">...cargando</p>
                  <p v-if="resourcesDict[type].latest" class="tarjeta-titulo">
                    {{ resourcesDict[type].latest.title }}
                  </p>
                  <span v-if="resourcesDict[type].latest">
                    <div class="abstract m-b-2">
                      {{ resourcesDict[type].latest.raw_abstract }}
                    </div>
                  </span>
                </div>
                <div class="tarjeta-pie">
                  <nuxt-link
                    class="boton boton-primario boton-chico"
                    aria-label="Ver capa en visualizador"
                    :to="resourcesDict[type].consultaTo"
                    @click.prevent="updateSelection(type)"
                  >
                    {{ resourcesDict[type].consultaLabel }}
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>
    </UiLayoutPaneles>
  </div>
</template>
<style>
.abstract {
  line-height: 1.4em;
  /* Cuando era un párrafo generado programáticamente se usaba:
  text-overflow: ellipsis;
  overflow: hidden;
  height: 1.2em;
  white-space: nowrap;*/
}
</style>
