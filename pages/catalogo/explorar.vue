<script setup>
// TODO: integrar los filtros de información
const resourcesStore = useSelectedResourcesStore();

const recursosTipo = ref("dataLayer");
const recursosFiltrados = ref([]);

const recursosFiltradosCapas = ref([]);
const recursosFiltradosTablas = ref([]);
const recursosFiltradosDocumentos = ref([]);

const sortDateArray = (array) => {
  return array.sort((a, b) => {
    return b.last_updated - a.last_updated;
  });
};

// dataLayer
const { resourcesList: listaRecursosCapas } = useGeonodeResources({
  resourceType: "dataLayer",
});
const capaMasReciente = ref([]);
watch(listaRecursosCapas, () => {
  resourcesStore.updateFilteredResources("dataLayer", listaRecursosCapas.value);
});
watch(
  () => resourcesStore.filteredResources["dataLayer"],
  () => {
    recursosFiltradosCapas.value =
      resourcesStore.filteredResources["dataLayer"];
    const capaOrdenada = sortDateArray(recursosFiltradosCapas.value)[0];
    capaMasReciente.value = {
      titulo: capaOrdenada.title,
      resumen: capaOrdenada.abstract,
      imagen: capaOrdenada.thumbnail_url,
    };
  },
  { deep: true }
);
// dataTable
const { resourcesList: listaRecursosTablas } = useGeonodeResources({
  resourceType: "dataTable",
});
const tablaMasReciente = ref([]);
watch(listaRecursosTablas, () => {
  resourcesStore.updateFilteredResources(
    "dataTable",
    listaRecursosTablas.value
  );
});
watch(
  () => resourcesStore.filteredResources["dataTable"],
  () => {
    recursosFiltradosTablas.value =
      resourcesStore.filteredResources["dataTable"];
    const tablaOrdenada = sortDateArray(recursosFiltradosTablas.value)[0];
    tablaMasReciente.value = {
      titulo: tablaOrdenada.title,
      resumen: tablaOrdenada.abstract,
      imagen: tablaOrdenada.thumbnail_url,
    };
  },
  { deep: true }
);
// document
const { resourcesList: listaRecursosDocumentos } = useGeonodeResources({
  resourceType: "document",
});
const documentoMasReciente = ref([]);
watch(listaRecursosDocumentos, () => {
  resourcesStore.updateFilteredResources(
    "document",
    listaRecursosDocumentos.value
  );
  // console.log(
  //   "Copia de los Recursos filtrados en el store",
  //   resourcesStore.filteredResources["document"].length
  // );
});
watch(
  () => resourcesStore.filteredResources["document"],
  () => {
    recursosFiltradosDocumentos.value =
      resourcesStore.filteredResources["document"];

    const documentoOrdenado = sortDateArray(
      recursosFiltradosDocumentos.value
    )[0];
    documentoMasReciente.value = {
      titulo: documentoOrdenado.title,
      resumen: documentoOrdenado.abstract,
      imagen: documentoOrdenado.thumbnail_url,
    };
    // groupResults();
    // console.log(
    //   "Copia de los Recursos filtrados en la vista",
    //   recursosFiltradosDocumentos.value
    // );
  },
  { deep: true }
);
</script>

<template>
  <div>
    <UiLayoutPaneles>
      <template #catalogo>
        <CatalogoListaMenuLateral />
      </template>

      <template #visualizador>
        <main id="principal" class="contenedor m-b-10 p-t-3">
          <CatalogoElementoFiltros
            :recursos-lista="recursosFiltrados"
            :recursos-tipo="recursosTipo"
            :categorias="[
              'categoría_0: Todas',
              'categoría_1: capas',
              'categoría_2: tablas',
              'categoría_3: documentos',
            ]"
          />

          <h2>Explora</h2>
          <div class="flex">
            <div class="columna-5">
              <nuxt-link
                class="tarjeta tarjeta-hipervinculo-interno"
                to="/catalogo/capas"
              >
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Capas geográficas</p>
                  <p class="tarjeta-etiqueta">
                    {{ listaRecursosCapas.length }} capas
                  </p>
                </div>
              </nuxt-link>
            </div>
            <div class="columna-5">
              <nuxt-link
                class="tarjeta tarjeta-hipervinculo-interno"
                to="/catalogo/tablas"
              >
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/becka.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Datos tabulados</p>
                  <p>{{ listaRecursosTablas.length }} datos tabulados</p>
                </div>
              </nuxt-link>
            </div>
            <div class="columna-5">
              <nuxt-link
                class="tarjeta tarjeta-hipervinculo-interno"
                to="/catalogo/documentos"
              >
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/baghira.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Documentos</p>
                  <p>{{ listaRecursosDocumentos.length }} documentos</p>
                </div>
              </nuxt-link>
            </div>
          </div>

          <h2>Lo más reciente</h2>
          <div class="flex">
            <div class="columna-5">
              <div class="tarjeta">
                <img
                  class="tarjeta-imagen"
                  :src="capaMasReciente.imagen"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Capa geográfica</p>
                  <p class="tarjeta-titulo">{{ capaMasReciente.titulo }}</p>
                  <p v-html="capaMasReciente.resumen"></p>
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
                <img
                  class="tarjeta-imagen"
                  :src="tablaMasReciente.imagen"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Datos tabulados</p>
                  <p class="tarjeta-titulo">{{ tablaMasReciente.titulo }}</p>
                  <p v-html="tablaMasReciente.resumen"></p>
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
                <img
                  class="tarjeta-imagen"
                  :src="documentoMasReciente.imagen"
                  alt=""
                />
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
