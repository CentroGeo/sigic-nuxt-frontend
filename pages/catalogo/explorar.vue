<script setup>
// Estas son las propiedades requeridas para filtrar avanzado
const recursosLista = ref([
  {
    categoria: "categoría 0: capas",
    fecha: "2025",
    palabras_clave: "clave 0, clave 1",
  },
  {
    categoria: "categoría 1: tablas",
    fecha: "2024",
    palabras_clave: "clave 2, clave 3",
  },
]);
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

    console.log(
      "Copia de los Recursos filtrados en la vista",
      recursosFiltrados.value
    );
  },
  { deep: true }
);
</script>
<template>
  <UiLayoutPaneles>
    <template #catalogo>
      <CatalogoLayoutNavegacion />
    </template>

    <template #visualizador>
      <div class="m-t-3 m-b-8">
        <div class="contenedor">
          <div class="flex flex-contenido-centrado">
            <div class="columna-14">
              <UiElementoBuscador
                :recursos-lista="recursosFiltrados"
                :recursos-tipo="recursosTipo"
                :categorias="[
                  'categoría_0: capas',
                  'categoría_1: tablas',
                  'categoría_2: documentos',
                ]"
              />
            </div>
            <div class="columna-1"></div>
          </div>
        </div>

        <div class="contenedor">
          <div class="flex flex-contenido-centrado">
            <div class="columna-14"><h2>Explora</h2></div>
            <div class="columna-1"></div>
          </div>

          <div class="flex flex-contenido-centrado">
            <div class="columna-5">
              <a class="tarjeta tarjeta-hipervinculo-interno" href="#"
                ><img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/asha.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Capas geográficas</p>
                  <p class="tarjeta-etiqueta">351 capas</p>
                </div></a
              >
            </div>
            <div class="columna-5">
              <a class="tarjeta tarjeta-hipervinculo-interno" href="#"
                ><img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/becka.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Datos tabulados</p>
                  <p>420 datos tabulados</p>
                </div></a
              >
            </div>
            <div class="columna-5">
              <a class="tarjeta tarjeta-hipervinculo-interno" href="#"
                ><img
                  class="tarjeta-imagen"
                  src="https://cdn.conahcyt.mx/sisdai/sisdai-css/documentacion/baghira.jpg"
                  alt=""
                />
                <div class="tarjeta-cuerpo">
                  <p class="tarjeta-titulo">Documentos</p>
                  <p>204 documentos</p>
                </div></a
              >
            </div>
          </div>

          <div class="flex flex-contenido-centrado">
            <div class="columna-14"><h2>Lo más reciente</h2></div>
            <div class="columna-1"></div>
          </div>

          <div class="flex flex-contenido-centrado">
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
        </div>
      </div>
    </template>
  </UiLayoutPaneles>
</template>
