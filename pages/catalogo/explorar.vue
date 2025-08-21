<script setup>
import { resourceTypeDic } from '~/utils/consulta';

const storeConsulta = useConsultaStore();
const storeFetched = useFetchedResourcesStore();
// const resources = computed(() => storeFetched[props.resourceType]);
const resources = computed(() => storeFetched['dataLayer']);
// const filteredResources = ref();
const filteredResourcesCapas = ref({});
const filteredResourcesTablas = ref({});
const filteredResourcesDocumentos = ref({});

const capaMasReciente = ref({});
const tablaMasReciente = ref({});
const documentoMasReciente = ref({});

const obtenerRecursosFiltrados = async (resourceTypeLayer) => {
  storeConsulta.resourceType = resourceTypeLayer;
  const { resourcesList } = await useGeonodeResources();
  storeFetched.updateFetchedResources(resourceTypeLayer, resourcesList.value);
  return storeFetched[resourceTypeLayer];
};

const obtenerMasReciente = (objeto) => ({
  titulo: objeto.title,
  resumen: objeto.abstract,
  imagen: objeto.thumbnail_url,
});

onMounted(async () => {
  if (resources.value.length === 0) {
    storeFetched.isLoading = true;
    // dataLayer
    filteredResourcesCapas.value = await obtenerRecursosFiltrados(resourceTypeDic.dataLayer);
    // dataTable
    filteredResourcesTablas.value = await obtenerRecursosFiltrados(resourceTypeDic.dataTable);
    // document
    filteredResourcesDocumentos.value = await obtenerRecursosFiltrados(resourceTypeDic.document);
    //
    storeFetched.isLoading = false;
  } else {
    filteredResourcesCapas.value = storeFetched['dataLayer'];
    filteredResourcesTablas.value = storeFetched['dataTable'];
    filteredResourcesDocumentos.value = storeFetched['document'];
  }
  // groupResults();
  capaMasReciente.value = obtenerMasReciente(filteredResourcesCapas.value[0]);
  tablaMasReciente.value = obtenerMasReciente(filteredResourcesTablas.value[0]);
  documentoMasReciente.value = obtenerMasReciente(filteredResourcesDocumentos.value[0]);
});

// watch(
//   () => filteredResourcesCapas.value,
//   () => {
//     // recursosFiltradosTablas.value = resourcesStore.filteredResources['dataTable'];
//     const tablaOrdenada = filteredResourcesCapas.value[0];
//     capaMasReciente.value = {
//       titulo: tablaOrdenada.title,
//       resumen: tablaOrdenada.abstract,
//       imagen: tablaOrdenada.thumbnail_url,
//     };
//   },
//   { deep: true }
// );

// // TODO: integrar los filtros de información
// const resourcesStore = useSelectedResourcesStore();

// const recursosTipo = ref('dataLayer');
// const recursosFiltrados = ref([]);

// const sortDateArray = (array) => {
//   return array.sort((a, b) => {
//     return b.last_updated - a.last_updated;
//   });
// };

// // dataLayer
// const { resourcesList: listaRecursosCapas } = useGeonodeResources({
//   resourceType: 'dataLayer',
// });
// const recursosFiltradosCapas = ref([]);
// const capaMasReciente = ref([]);
// watch(listaRecursosCapas, () => {
//   resourcesStore.updateFilteredResources('dataLayer', listaRecursosCapas.value);
// });
// watch(
//   () => resourcesStore.filteredResources['dataLayer'],
//   () => {
//     recursosFiltradosCapas.value = resourcesStore.filteredResources['dataLayer'];
//     const capaOrdenada = sortDateArray(recursosFiltradosCapas.value)[0];
//     capaMasReciente.value = {
//       titulo: capaOrdenada.title,
//       resumen: capaOrdenada.abstract,
//       imagen: capaOrdenada.thumbnail_url,
//     };
//   },
//   { deep: true }
// );

// // dataTable
// const { resourcesList: listaRecursosTablas } = useGeonodeResources({
//   resourceType: 'dataTable',
// });
// const recursosFiltradosTablas = ref([]);
// const tablaMasReciente = ref([]);
// watch(listaRecursosTablas, () => {
//   resourcesStore.updateFilteredResources('dataTable', listaRecursosTablas.value);
// });
// watch(
//   () => resourcesStore.filteredResources['dataTable'],
//   () => {
//     recursosFiltradosTablas.value = resourcesStore.filteredResources['dataTable'];
//     const tablaOrdenada = sortDateArray(recursosFiltradosTablas.value)[0];
//     tablaMasReciente.value = {
//       titulo: tablaOrdenada.title,
//       resumen: tablaOrdenada.abstract,
//       imagen: tablaOrdenada.thumbnail_url,
//     };
//   },
//   { deep: true }
// );

// // document
// const { resourcesList: listaRecursosDocumentos } = useGeonodeResources({
//   resourceType: 'document',
// });
// const recursosFiltradosDocumentos = ref([]);
// const documentoMasReciente = ref([]);
// watch(listaRecursosDocumentos, () => {
//   resourcesStore.updateFilteredResources('document', listaRecursosDocumentos.value);
//   // console.log(
//   //   "Copia de los Recursos filtrados en el store",
//   //   resourcesStore.filteredResources["document"].length
//   // );
// });
// watch(
//   () => resourcesStore.filteredResources['document'],
//   () => {
//     recursosFiltradosDocumentos.value = resourcesStore.filteredResources['document'];
//     const documentoOrdenado = sortDateArray(recursosFiltradosDocumentos.value)[0];
//     documentoMasReciente.value = {
//       titulo: documentoOrdenado.title,
//       resumen: documentoOrdenado.abstract,
//       imagen: documentoOrdenado.thumbnail_url,
//     };
//     // groupResults();
//     // console.log(
//     //   "Copia de los Recursos filtrados en la vista",
//     //   recursosFiltradosDocumentos.value
//     // );
//   },
//   { deep: true }
// );
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
                  <p class="tarjeta-etiqueta">{{ filteredResourcesCapas.length }} capas</p>
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
                  <p>{{ filteredResourcesTablas.length }} datos tabulados</p>
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
                  <p>{{ filteredResourcesDocumentos.length }} documentos</p>
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
