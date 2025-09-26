<script setup>
import { resourceTypeDic } from '~/utils/consulta';
const storeResources = useResourcesCatalogoStore();
storeResources.getTotalResources(resourceTypeDic.dataLayer);
storeResources.getTotalResources(resourceTypeDic.dataTable);
storeResources.getTotalResources(resourceTypeDic.document);

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
/* import { resourceTypeDic } from '~/utils/consulta';
const storeFetched = useFetchedResources2Store();

storeFetched.checkFilling(resourceTypeDic.dataLayer);
storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

/**
 * Devuelve un número con el tamaño de recursos.
 * @param {String} type tipo de recursos a obtener el tamaño.
 * @returns {Number} número de recursos.
 */
/*const obtenerLength = (type) => {
  return computed(() => storeFetched.byResourceType(type).length || false);
};

const resourcesCapasLength = obtenerLength(resourceTypeDic.dataLayer);
const resourcesTablasLength = obtenerLength(resourceTypeDic.dataTable);
const resourcesDocumentosLength = obtenerLength(resourceTypeDic.document);

/**
 * Devuelve un objeto con el recurso más reciente.
 * @param {String} type tipo de recursos a obtener más reciente.
 * @returns {Object} objeto de recursos más reciente.
 */
/*const obtenerMasReciente = (type) => {
  return computed(() => storeFetched.byResourceType(type)[0] || false);
};

const capaMasReciente = obtenerMasReciente(resourceTypeDic.dataLayer);
const tablaMasReciente = obtenerMasReciente(resourceTypeDic.dataTable);
const documentoMasReciente = obtenerMasReciente(resourceTypeDic.document);

const formatearAbstract = (resource) => {
  let formatedAbstract = 'Sin descripción';
  if (resource?.raw_abstract) {
    formatedAbstract = resource?.raw_abstract
      .replace(/^<p>/, '')
      .replace(/<\/p>$/, '')
      .replace(/^<pre>/, '')
      .replace(/<\/pre>$/, '');
  }
  const content = `
    <p style="text-overflow: ellipsis; overflow: hidden; height: 1.2em; white-space: nowrap; "
      >${formatedAbstract}
    </p>`;
  return content;
}; */
</script>

<template>
  <div>
    <UiLayoutPaneles>
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
          <!-- <div class="flex">
            <div class="columna-5">
              <nuxt-link class="tarjeta tarjeta-hipervinculo-interno" to="/catalogo/explorar/capas">
                <img class="tarjeta-imagen" src="/img/thumbnail-capas.png" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Capas geográficas</p>
                  <p class="tarjeta-etiqueta">
                    {{ !resourcesCapasLength ? '...cargando' : resourcesCapasLength + ' capas' }}
                  </p>
                </div>
              </nuxt-link>
            </div>
            <div class="columna-5">
              <nuxt-link
                class="tarjeta tarjeta-hipervinculo-interno"
                to="/catalogo/explorar/tablas"
              >
                <img class="tarjeta-imagen" src="/img/thumbnail-tablas.png" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Datos tabulados</p>
                  <p class="tarjeta-etiqueta">
                    {{
                      !resourcesTablasLength
                        ? '...cargando'
                        : resourcesTablasLength + ' datos tabulados'
                    }}
                  </p>
                </div>
              </nuxt-link>
            </div>
            <div class="columna-5">
              <nuxt-link
                class="tarjeta tarjeta-hipervinculo-interno"
                to="/catalogo/explorar/documentos"
              >
                <img class="tarjeta-imagen" src="/img/thumbnail-docs.png" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Documentos</p>
                  <p class="tarjeta-etiqueta">
                    {{
                      !resourcesDocumentosLength
                        ? '...cargando'
                        : resourcesDocumentosLength + ' documentos'
                    }}
                  </p>
                </div>
              </nuxt-link>
            </div>
          </div> -->

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
                    <div>
                      <p class="abstract">
                        {{ resourcesDict[type].latest.raw_abstract }}
                      </p>
                    </div>
                  </span>
                </div>
                <div class="tarjeta-pie">
                  <nuxt-link
                    class="boton boton-primario boton-chico"
                    aria-label="Ver capa en visualizador"
                    :to="resourcesDict[type].consultaTo"
                  >
                    {{ resourcesDict[type].consultaLabel }}
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div>
          <!-- <div class="flex">
            <div class="columna-5">
              <div class="tarjeta">
                <img class="tarjeta-imagen" :src="capaMasReciente.thumbnail_url" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Capa geográfica</p>
                  <p v-if="!capaMasReciente">...cargando</p>
                  <p v-if="capaMasReciente" class="tarjeta-titulo">
                    {{ capaMasReciente.title }}
                  </p>
                  <span v-if="capaMasReciente">
                     eslint-disable-next-line vue/no-v-html -->
          <!--<div v-html="formatearAbstract(capaMasReciente)"></div>
                  </span>
                </div>
                <div class="tarjeta-pie">
                  <nuxt-link
                    class="boton boton-primario boton-chico"
                    aria-label="Ver capa en visualizador"
                    :to="`/consulta/capas`"
                  >
                    Ver Capa en visualizador
                  </nuxt-link>
                </div>
              </div>
            </div>
            <div class="columna-5">
              <div class="tarjeta">
                <img class="tarjeta-imagen" :src="tablaMasReciente.thumbnail_url" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Datos tabulados</p>
                  <p v-if="!tablaMasReciente">...cargando</p>
                  <p v-if="tablaMasReciente" class="tarjeta-titulo">
                    {{ tablaMasReciente.title }}
                  </p>
                  <span v-if="tablaMasReciente">
                     eslint-disable-next-line vue/no-v-html -->
          <!-- <div v-html="formatearAbstract(tablaMasReciente)"></div>
                  </span>
                </div>
                <div class="tarjeta-pie">
                  <nuxt-link
                    class="boton boton-primario boton-chico"
                    aria-label="Ver tabla en visualizador"
                    :to="`/consulta/tablas`"
                  >
                    Ver archivo en visualizador
                  </nuxt-link>
                </div>
              </div>
            </div>
            <div class="columna-5">
              <div class="tarjeta">
                <img class="tarjeta-imagen" :src="documentoMasReciente.thumbnail_url" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Documento</p>
                  <p v-if="!documentoMasReciente">...cargando</p>
                  <p v-if="documentoMasReciente" class="tarjeta-titulo">
                    {{ documentoMasReciente.title }}
                  </p>
                  <span v-if="documentoMasReciente">
                     eslint-disable-next-line vue/no-v-html -->
          <!-- <span v-html="formatearAbstract(documentoMasReciente)"></span>
                  </span>
                </div>
                <div class="tarjeta-pie">
                  <nuxt-link
                    class="boton boton-primario boton-chico"
                    aria-label="Ver documento en visualizador"
                    :to="`/consulta/documentos`"
                  >
                    Ver Documento en visualizador
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div> -->
        </main>
      </template>
    </UiLayoutPaneles>
  </div>
</template>
<style>
.abstract {
  text-overflow: ellipsis;
  overflow: hidden;
  height: 1.2em;
  white-space: nowrap;
}
</style>
