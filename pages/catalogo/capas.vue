<script setup>
// // BuscadorAvanzado
// const recursosLista = ref([
//   {
//     categoria: "categoría 0: capas",
//     fecha: "2025",
//     palabras_clave: "clave 0, clave 1",
//   },
//   {
//     categoria: "categoría 1: tablas",
//     fecha: "2024",
//     palabras_clave: "clave 2, clave 3",
//   },
// ]);
const recursosTipo = ref("dataLayer");
const recursosFiltrados = ref([]);

// const resourcesStore = useSelectedResourcesStore();
// const { resourcesList } = useGeonodeResources({
//   resourceType: recursosTipo.value,
// });
// // console.log(
// //   "Recursos filtrados desde Geonode en específico los",
// //   recursosTipo.value,
// //   resourcesList
// // );

// watch(resourcesList, () => {
//   resourcesStore.updateFilteredResources(
//     recursosTipo.value,
//     resourcesList.value
//   );
//   // console.log(
//   //   "Copia de los Recursos filtrados en el store",
//   //   resourcesStore.filteredResources[recursosTipo.value]
//   // );
// });

// watch(
//   () => resourcesStore.filteredResources[recursosTipo.value],
//   () => {
//     recursosFiltrados.value =
//       resourcesStore.filteredResources[recursosTipo.value];

//     // groupResults();

//     console.log(
//       "Copia de los Recursos filtrados en la vista",
//       recursosFiltrados.value
//     );
//   },
//   { deep: true }
// );

// // TablaAccesible

// const variables = ref([]);
// const datos = ref([]);
// const paginaActual = ref(0);
// const totalFeatures = ref(0);
// const tamanioPagina = 10;

// const config = useRuntimeConfig();

// const resourceType = "dataTable";

// const obtenerDatos = async () => {
//   const url = new URL(`${config.public.geoserverUrl}/ows`);
//   url.search = new URLSearchParams({
//     service: "WFS",
//     version: "1.0.0",
//     request: "GetFeature",
//     typeName: "geonode:centroides_mapa2_maquinaria_mgn2020",
//     outputFormat: "application/json",
//     maxFeatures: tamanioPagina,
//     startIndex: paginaActual.value * tamanioPagina,
//   }).toString();

//   const res = await fetch(url);
//   const data = await res.json();

//   if (data.totalFeatures !== undefined) {
//     totalFeatures.value = data.totalFeatures;
//   }

//   const atributos = data.features.map((f) => f.properties);
//   variables.value = Object.keys(atributos[0] || {});
//   datos.value = atributos;
//   console.log(datos);
// };

// watch(paginaActual, obtenerDatos, { immediate: true });
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
            <div class="columna-14">
              <div class="flex">
                <h2>Capas geográficas</h2>
                <UiNumeroElementos :numero="125" />
              </div>
            </div>
            <div class="columna-1"></div>
            <div class="columna-15">
              <ClientOnly>
                <UiTablaAccesibleV2
                  :variables="[
                    'Nombre',
                    'Tipo',
                    'Categoría',
                    'Actualización',
                    'Acciones',
                    'maq_total',
                    'maq_trilla',
                    'maq_motog',
                    'otra_maq',
                    'tot_tract',
                  ]"
                  :datos="[
                    {
                      Nombre: 1,
                      Tipo: 'Capa geográfica',
                      Categoría: '27',
                      Actualización: '001',
                      Acciones: 'Balancán',
                      maq_total: 46,
                      maq_trilla: 5,
                      maq_motog: 1,
                      otra_maq: 34,
                      tot_tract: 1665,
                    },
                    {
                      Nombre: 2,
                      Tipo: '27002',
                      Categoría: '27',
                      Actualización: '002',
                      Acciones: 'Cárdenas',
                      maq_total: 80,
                      maq_trilla: 1,
                      maq_motog: 0,
                      otra_maq: 60,
                      tot_tract: 3632,
                    },
                    {
                      Nombre: 3,
                      Tipo: '27003',
                      Categoría: '27',
                      Actualización: '003',
                      Acciones: 'Centla',
                      maq_total: 10,
                      maq_trilla: 1,
                      maq_motog: 0,
                      otra_maq: 9,
                      tot_tract: 123,
                    },
                    {
                      Nombre: 4,
                      Tipo: '27004',
                      Categoría: '27',
                      Actualización: '004',
                      Acciones: 'Centro',
                      maq_total: 28,
                      maq_trilla: 0,
                      maq_motog: 2,
                      otra_maq: 22,
                      tot_tract: 309,
                    },
                    {
                      Nombre: 5,
                      Tipo: '27005',
                      Categoría: '27',
                      Actualización: '005',
                      Acciones: 'Comalcalco',
                      maq_total: 13,
                      maq_trilla: 1,
                      maq_motog: 0,
                      otra_maq: 12,
                      tot_tract: 696,
                    },
                    {
                      Nombre: 6,
                      Tipo: '27006',
                      Categoría: '27',
                      Actualización: '006',
                      Acciones: 'Cunduacán',
                      maq_total: 13,
                      maq_trilla: 0,
                      maq_motog: 0,
                      otra_maq: 13,
                      tot_tract: 706,
                    },
                    {
                      Nombre: 7,
                      Tipo: '27007',
                      Categoría: '27',
                      Actualización: '007',
                      Acciones: 'Emiliano Zapata',
                      maq_total: 12,
                      maq_trilla: 2,
                      maq_motog: 0,
                      otra_maq: 10,
                      tot_tract: 401,
                    },
                    {
                      Nombre: 8,
                      Tipo: '27008',
                      Categoría: '27',
                      Actualización: '008',
                      Acciones: 'Huimanguillo',
                      maq_total: 89,
                      maq_trilla: 1,
                      maq_motog: 1,
                      otra_maq: 82,
                      tot_tract: 2175,
                    },
                    {
                      Nombre: 9,
                      Tipo: '27009',
                      Categoría: '27',
                      Actualización: '009',
                      Acciones: 'Jalapa',
                      maq_total: 7,
                      maq_trilla: 0,
                      maq_motog: 0,
                      otra_maq: 7,
                      tot_tract: 151,
                    },
                    {
                      Nombre: 10,
                      Tipo: '27010',
                      Categoría: '27',
                      Actualización: '010',
                      Acciones: 'Jalpa de Méndez',
                      maq_total: 4,
                      maq_trilla: 0,
                      maq_motog: 1,
                      otra_maq: 2,
                      tot_tract: 371,
                    },
                  ]"
                />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UiLayoutPaneles>
</template>
