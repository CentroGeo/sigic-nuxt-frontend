<script setup>
// TODO: demo recursos
// const { listaRecursos } = useDemoGeonodeResources();

const { data } = await useFetch(
  "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset"
);
console.log("data.value", data.value);
// console.log("data.value.links.next", data.value.links.next);

// const { data: resources } = await useFetch(
//   "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset"
// );
const { pending, data: resources } = useFetch(
  "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
  {
    // TODO: investigar propiedades
    lazy: false,
    // server: false,
  }
);
// console.log("resources", resources.value.resources);

// const listaRecursos = ref([]);
// listaRecursos.value = await fetch(
const listaRecursos = ref(
  await fetch(
    "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
    {
      method: "GET",
    }
  )
    .then((response) => {
      const res = response;
      // console.log("response", res);
      return res.json();
    })
    .then((json) => {
      const data = json.resources;
      // console.log("data", data);
      return data;
    })
);
console.log("listaRecursos.value", listaRecursos.value);
// console.log(
//   "listaRecursos.value[0].last_updated",
//   listaRecursos.value[0].last_updated
// );
// console.log(
//   "listaRecursos.value[0].resource_type",
//   listaRecursos.value[0].resource_type
// );

const recursosTipo = ref("dataLayer");
const recursosFiltrados = ref([]);

const resourcesStore = useSelectedResourcesStore();
const { resourcesList } = useGeonodeResources({
  resourceType: recursosTipo.value,
});
// console.log(
//   "Recursos filtrados desde Geonode en específico los",
//   recursosTipo.value,
//   resourcesList
// );
watch(resourcesList, () => {
  resourcesStore.updateFilteredResources(
    recursosTipo.value,
    resourcesList.value
  );
  // console.log(
  //   "Copia de los Recursos filtrados en el store",
  //   resourcesStore.filteredResources[recursosTipo.value]
  // );
});
watch(
  () => resourcesStore.filteredResources[recursosTipo.value],
  () => {
    recursosFiltrados.value =
      resourcesStore.filteredResources[recursosTipo.value];

    // groupResults();

    // console.log(
    //   "Copia de los Recursos filtrados en la vista",
    //   recursosFiltrados.value
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
          <div v-if="pending">...cargando</div>
          <div v-else>
            <div class="flex">
              <b v-for="recurso in listaRecursos" :key="recurso.title">
                {{ recurso.resource_type }}
              </b>
            </div>
            <!-- {{ data }} -->
            {{ resources }}
          </div>

          <CatalogoElementoFiltros
            :recursos-lista="recursosFiltrados"
            :recursos-tipo="recursosTipo"
            :categorias="[
              'categoría_0: capas',
              'categoría_1: tablas',
              'categoría_2: documentos',
            ]"
          />

          <h2>Explora</h2>
          <div class="flex">
            <!-- TODO: v-for por conjunto[totalCap,totalTab,totalDoc] -->
            <div class="columna-5">
              <a class="tarjeta tarjeta-hipervinculo-interno" href="#">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Capas geográficas</p>
                  <p class="tarjeta-etiqueta">351 capas</p>
                </div>
              </a>
            </div>
            <div class="columna-5">
              <a class="tarjeta tarjeta-hipervinculo-interno" href="#">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/becka.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Datos tabulados</p>
                  <p>420 datos tabulados</p>
                </div>
              </a>
            </div>
            <div class="columna-5">
              <a class="tarjeta tarjeta-hipervinculo-interno" href="#">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/baghira.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Documentos</p>
                  <p>204 documentos</p>
                </div>
              </a>
            </div>
          </div>

          <h2>Lo más reciente</h2>
          <div class="flex">
            <!-- TODO: iterar por los más recientes -->
            <div class="columna-5">
              <div class="tarjeta">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Capa geográfica</p>
                  <p class="tarjeta-titulo">Cuerpos de agua</p>
                  <p>
                    Mapa interactivo: Rescate del Lago de Texcoco, diagnóstico
                  </p>
                </div>
                <div class="tarjeta-pie">
                  <button type="button" class="boton-primario boton-chico">
                    Ver Capa en visualizador
                  </button>
                </div>
              </div>
            </div>
            <div class="columna-5">
              <div class="tarjeta">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Datos tabulados</p>
                  <p class="tarjeta-titulo">Afluencia Diaria Trolebus</p>
                  <p>Afluencia diaria desde enero de 2022 a Mayo de 2025</p>
                </div>
                <div class="tarjeta-pie">
                  <button type="button" class="boton-primario boton-chico">
                    Ver archivo en visualizador
                  </button>
                </div>
              </div>
            </div>
            <div class="columna-5">
              <div class="tarjeta">
                <img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/kale-1.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-etiqueta">Documento</p>
                  <p class="tarjeta-titulo">Carpetas de investigación FGJ</p>
                  <p>
                    Información actualizada de las carpetas de investigación de
                    la Fiscalía General de Justicia (FGJ)
                  </p>
                </div>
                <div class="tarjeta-pie">
                  <button type="button" class="boton-primario boton-chico">
                    Ver Documento en visualizador
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </template>
    </UiLayoutPaneles>
  </div>
</template>
