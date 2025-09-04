<script setup>
import { resourceTypeDic } from '~/utils/consulta';
const storeFetched = useFetchedResources2Store();

storeFetched.checkFilling(resourceTypeDic.dataLayer);
storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

/**
 * Devuelve un número con el tamaño de recursos.
 * @param {String} type tipo de recursos a obtener el tamaño.
 * @returns {Number} número de recursos.
 */
const obtenerLength = (type) => {
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
const obtenerMasReciente = (type) => {
  return computed(() => storeFetched.byResourceType(type)[0] || false);
};

const capaMasReciente = obtenerMasReciente(resourceTypeDic.dataLayer);
const tablaMasReciente = obtenerMasReciente(resourceTypeDic.dataTable);
const documentoMasReciente = obtenerMasReciente(resourceTypeDic.document);
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
            <div class="columna-5">
              <nuxt-link class="tarjeta tarjeta-hipervinculo-interno" to="/catalogo/capas">
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
              <nuxt-link class="tarjeta tarjeta-hipervinculo-interno" to="/catalogo/tablas">
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
              <nuxt-link class="tarjeta tarjeta-hipervinculo-interno" to="/catalogo/documentos">
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
          </div>

          <h2>Lo más reciente</h2>
          <div class="flex">
            <div class="columna-5">
              <div class="tarjeta">
                <img class="tarjeta-imagen" :src="capaMasReciente.thumbnail_url" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Capa geográfica</p>
                  <p class="tarjeta-titulo">
                    {{ !capaMasReciente ? '...cargando' : capaMasReciente.title }}
                  </p>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="capaMasReciente.abstract"></div>
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
                  <p class="tarjeta-titulo">
                    {{ !tablaMasReciente ? '...cargando' : tablaMasReciente.title }}
                  </p>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="tablaMasReciente.abstract"></div>
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
                  <p class="tarjeta-titulo">
                    {{ !documentoMasReciente ? '...cargando' : documentoMasReciente.title }}
                  </p>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="documentoMasReciente.abstract"></div>
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
          </div>
        </main>
      </template>
    </UiLayoutPaneles>
  </div>
</template>
