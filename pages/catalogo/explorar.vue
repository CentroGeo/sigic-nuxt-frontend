<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const storeFetched = useFetchedResources2Store();

storeFetched.checkFilling(resourceTypeDic.dataLayer);
storeFetched.checkFilling(resourceTypeDic.dataTable);
storeFetched.checkFilling(resourceTypeDic.document);

const resourcesCapas = computed(() => storeFetched.byResourceType(resourceTypeDic.dataLayer));
const resourcesTablas = computed(() => storeFetched.byResourceType(resourceTypeDic.dataTable));
const resourcesDocumentos = computed(() => storeFetched.byResourceType(resourceTypeDic.document));

/**
 * Devuelve un objeto con el recurso más reciente.
 * @param {String} objeto recursos a obtener el más reciente.
 * @returns {Object} objeto de recursos más reciente.
 */
const obtenerMasReciente = (objeto) => ({
  titulo: objeto[0].title,
  resumen: objeto[0].abstract,
  imagen: objeto[0].thumbnail_url,
});

const capaMasReciente = ref({});
const tablaMasReciente = ref({});
const documentoMasReciente = ref({});

watch([resourcesCapas, resourcesTablas, resourcesDocumentos], () => {
  capaMasReciente.value = obtenerMasReciente(resourcesCapas.value);
  tablaMasReciente.value = obtenerMasReciente(resourcesTablas.value);
  documentoMasReciente.value = obtenerMasReciente(resourcesDocumentos.value);
});
</script>

<template>
  <div>
    <UiLayoutPaneles>
      <template #catalogo>
        <CatalogoListaMenuLateral />
      </template>

      <template #visualizador>
        <main id="principal" class="contenedor m-b-10 p-t-3">
          <!-- <CatalogoElementoFiltros
            :recursos-lista="recursosFiltrados"
            :recursos-tipo="recursosTipo"
          /> -->

          <h2>Explora</h2>
          <div class="flex">
            <div class="columna-5">
              <nuxt-link class="tarjeta tarjeta-hipervinculo-interno" to="/catalogo/capas">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Capas geográficas</p>
                  <p class="tarjeta-etiqueta">{{ resourcesCapas.length }} capas</p>
                </div>
              </nuxt-link>
            </div>
            <div class="columna-5">
              <nuxt-link class="tarjeta tarjeta-hipervinculo-interno" to="/catalogo/tablas">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/becka.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Datos tabulados</p>
                  <p>{{ resourcesTablas.length }} datos tabulados</p>
                </div>
              </nuxt-link>
            </div>
            <div class="columna-5">
              <nuxt-link class="tarjeta tarjeta-hipervinculo-interno" to="/catalogo/documentos">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/baghira.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Documentos</p>
                  <p>{{ resourcesDocumentos.length }} documentos</p>
                </div>
              </nuxt-link>
            </div>
          </div>

          <h2>Lo más reciente</h2>
          <div class="flex">
            <div class="columna-5">
              <div class="tarjeta">
                <img class="tarjeta-imagen" :src="capaMasReciente.imagen" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Capa geográfica</p>
                  <p class="tarjeta-titulo">{{ capaMasReciente.titulo }}</p>
                  <p>{{ capaMasReciente.resumen }}</p>
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
                <img class="tarjeta-imagen" :src="tablaMasReciente.imagen" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Datos tabulados</p>
                  <p class="tarjeta-titulo">{{ tablaMasReciente.titulo }}</p>
                  <p>{{ tablaMasReciente.resumen }}</p>
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
                <img class="tarjeta-imagen" :src="documentoMasReciente.imagen" alt="" />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Documento</p>
                  <p class="tarjeta-titulo">
                    {{ documentoMasReciente.titulo }}
                  </p>
                  <p>
                    {{ documentoMasReciente.resumen }}
                  </p>
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
