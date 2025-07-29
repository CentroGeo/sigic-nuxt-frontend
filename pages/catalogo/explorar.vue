<script setup>
// TODO: demo recursos
const { listaRecursosV2, data } = useDemoGeonodeResources();
// console.log("datos", datas);
// console.log("listaRecursosV2", listaRecursosV2);

const listaRecursos = ref([]);
// listaRecursos.value = await fetch(
const datos = ref(
  await fetch(
    "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=document",
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
      // TODO: aquí se pueden obtener las distintas propiedades
      // links, page, page_size, resorces, total
      const data = json;
      // enlaces.value = json.links;
      // pagina.page = value.page;
      // paginaTamanio.value = json.page_size;
      // TODO: iterar sobre las propiedades necesarias
      json.resources.forEach((resource) => {
        listaRecursos.value.push({
          // pk: resource.pk,
          // uuid: resource.uuid,
          // title: resource.title,
          resource_type: resource.resource_type,
          // keywords: resource.keywords,
          // category: resource.category,
          // abstract: resource.abstract,
          // attribution: resource.attribution,
          // thumbnail_url: resource.thumbnail_url,
          // extent: resource.extent,
          // date: resource.date,
          // date_type: resource.date_type,
          // created: resource.created,
          last_updated: resource.last_updated,
        });
      });
      // listaRecursos.value = json.resources;
      // total.value = json.total;

      // console.log("data", data);
      return data;
    })
);

// const { data } = await useFetch(
//   "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset"
// );
// console.log("data.value", data.value);
// console.log("data.value", data.value.links);
// console.log("data.value", data.value.page);
// console.log("data.value", data.value.page_size);
// console.log("data.value.resources", data.value.resources);
// console.log("data.value", data.value.total);
// console.log("data.value.links.next", data.value.links.next);

// const { data: resources } = await useFetch(
//   "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset"
// );

// const {
//   pending,
//   data: datosUseFetch,
//   refresh,
// } = useFetch(
//   "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset",
//   // "http://10.2.102.99/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=document",
//   {
//     // TODO: investigar propiedades
//     lazy: false,
//     // server: false,
//     // transform: (datosUseFetch) => {
//     //   return datosUseFetch.map((dato) => ({
//     //     links: dato.links,
//     //   }));
//     // },
//     // pick: ["links", "page", "page_size", "resources", "total"],
//     // pick: ["resources"],
//   }
// );
// console.log("datosUseFetch.resources", datosUseFetch.value);

// const { data: catalogoInfo } = useAsyncData(
//   "catalogoInfo",
//   async () => {
//     const [dataset, document] = await Promise.all([
//       $fetch(
//         "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=dataset"
//       ),
//       $fetch(
//         "https://stable.demo.geonode.org/api/v2/resources?page=1&page_size=15&filter%7Bresource_type%7D=document"
//       ),
//     ]);
//     return {
//       dataset,
//       document,
//     };
//   },
//   {
//     lazy: false,
//     // transform: (catalogoInfo) => {
//     //   return {
//     //     dataset: catalogoInfo.dataset,
//     //     document: catalogoInfo.document,
//     //   };
//     // },
//   }
// );

// const recursos = {
//   pk: "15148",
//   uuid: "bfd94a65-0817-40cf-bb52-f8bdaf471555",
//   resource_type: "dataset",
//   // polymorphic_ctype_id: "58",
//   // perms: ["download_resourcebase", "view_resourcebase"],
//   owner: {
//     pk: 6977,
//     username: "fadyhammad",
//     first_name: "",
//     last_name: "",
//     avatar: "https://stable.demo.geonode.org/static/geonode/img/avatar.png",
//     is_superuser: false,
//     is_staff: false,
//     email: "fadyhammad685@gmail.com",
//     link: "https://stable.demo.geonode.org/api/v2/users/6977",
//   },
//   poc: [
//     {
//       pk: 6977,
//       username: "fadyhammad",
//       first_name: "",
//       last_name: "",
//       avatar: "https://stable.demo.geonode.org/static/geonode/img/avatar.png",
//       is_superuser: false,
//       is_staff: false,
//       email: "fadyhammad685@gmail.com",
//       link: "https://stable.demo.geonode.org/api/v2/users/6977",
//     },
//   ],
//   metadata_author: [
//     {
//       pk: 6977,
//       username: "fadyhammad",
//       first_name: "",
//       last_name: "",
//       avatar: "https://stable.demo.geonode.org/static/geonode/img/avatar.png",
//       is_superuser: false,
//       is_staff: false,
//       email: "fadyhammad685@gmail.com",
//       link: "https://stable.demo.geonode.org/api/v2/users/6977",
//     },
//   ],
//   // processor: [],
//   // publisher: [],
//   // custodian: [],
//   // distributor: [],
//   // resource_user: [],
//   // resource_provider: [],
//   // originator: [],
//   // principal_investigator: [],
//   keywords: [],
//   tkeywords: [],
//   // regions: [],
//   category: null,
//   title: "gaza_strip_geobackeg",
//   abstract: "",
//   attribution: null,
//   // alternate: "geonode:gaza_strip_geobackeg",
//   doi: null,
//   bbox_polygon: {
//     type: "Polygon",
//     coordinates: [
//       [
//         [34.21942995590014, 31.225941694567965],
//         [34.21942995590014, 31.594897091884107],
//         [34.56677582288928, 31.594897091884107],
//         [34.56677582288928, 31.225941694567965],
//         [34.21942995590014, 31.225941694567965],
//       ],
//     ],
//   },
//   ll_bbox_polygon: {
//     type: "Polygon",
//     coordinates: [
//       [
//         [34.21942995590014, 31.225941694567965],
//         [34.21942995590014, 31.594897091884107],
//         [34.56677582288928, 31.594897091884107],
//         [34.56677582288928, 31.225941694567965],
//         [34.21942995590014, 31.225941694567965],
//       ],
//     ],
//   },
//   // srid: "EPSG:4326",
//   date: "2025-07-28T09:52:43.067920Z",
//   date_type: "publication",
//   // edition: null,
//   // purpose: null,
//   // maintenance_frequency: null,
//   // restriction_code_type: null,
//   // constraints_other: null,
//   license: {
//     identifier: "not_specified",
//   },
//   // language: "eng",
//   spatial_representation_type: null,
//   // temporal_extent_start: null,
//   // temporal_extent_end: null,
//   // supplemental_information: "No information provided",
//   // data_quality_statement: null,
//   // group: null,
//   // popular_count: "2",
//   // share_count: "0",
//   // rating: "0",
//   // featured: false,
//   // advertised: true,
//   is_published: true,
//   is_approved: true,
//   detail_url: "https://stable.demo.geonode.org/catalogue/#/dataset/15148",
//   embed_url:
//     "https://stable.demo.geonode.org/datasets/geonode:gaza_strip_geobackeg/embed",
//   created: "2025-07-28T09:52:43.112042Z",
//   last_updated: "2025-07-28T09:52:48.809879Z",
//   // raw_abstract: "",
//   // raw_purpose: "None",
//   // raw_constraints_other: "None",
//   // raw_supplemental_information: "No information provided",
//   // raw_data_quality_statement: "None",
//   metadata_only: false,
//   processed: true,
//   state: "PROCESSED",
//   subtype: "vector",
//   sourcetype: "LOCAL",
//   is_copyable: true,
//   download_url:
//     "https://stable.demo.geonode.org/datasets/geonode:gaza_strip_geobackeg/dataset_download",
//   download_urls: [
//     {
//       url: "/datasets/geonode:gaza_strip_geobackeg/dataset_download",
//       ajax_safe: true,
//       default: true,
//     },
//     {
//       url: "https://stable.demo.geonode.org/api/v2/assets/9172/download",
//       ajax_safe: true,
//       default: false,
//     },
//   ],
//   extent: {
//     coords: [
//       34.21942995590014, 31.225941694567965, 34.56677582288928,
//       31.594897091884107,
//     ],
//     srid: "EPSG:4326",
//   },
//   favorite: false,
//   thumbnail_url:
//     "https://stable.demo.geonode.org/uploaded/thumbs/dataset-bfd94a65-0817-40cf-bb52-f8bdaf471555-thumb-5fb5330a-f420-4000-bee4-6aa5491f912d.jpg",
//   links: [
//     {
//       extension: "xml",
//       link_type: "metadata",
//       name: "Atom",
//       mime: "text/xml",
//       url: "https://stable.demo.geonode.org/catalogue/csw?request=GetRecordById&service=CSW&version=2.0.2&id=bfd94a65-0817-40cf-bb52-f8bdaf471555&outputschema=http%3A%2F%2Fwww.w3.org%2F2005%2FAtom&elementsetname=full",
//     },
//     {
//       extension: "xml",
//       link_type: "metadata",
//       name: "DIF",
//       mime: "text/xml",
//       url: "https://stable.demo.geonode.org/catalogue/csw?request=GetRecordById&service=CSW&version=2.0.2&id=bfd94a65-0817-40cf-bb52-f8bdaf471555&outputschema=http%3A%2F%2Fgcmd.gsfc.nasa.gov%2FAboutus%2Fxml%2Fdif%2F&elementsetname=full",
//     },
//     {
//       extension: "xml",
//       link_type: "metadata",
//       name: "Dublin Core",
//       mime: "text/xml",
//       url: "https://stable.demo.geonode.org/catalogue/csw?request=GetRecordById&service=CSW&version=2.0.2&id=bfd94a65-0817-40cf-bb52-f8bdaf471555&outputschema=http%3A%2F%2Fwww.opengis.net%2Fcat%2Fcsw%2F2.0.2&elementsetname=full",
//     },
//     {
//       extension: "xml",
//       link_type: "metadata",
//       name: "ebRIM",
//       mime: "text/xml",
//       url: "https://stable.demo.geonode.org/catalogue/csw?request=GetRecordById&service=CSW&version=2.0.2&id=bfd94a65-0817-40cf-bb52-f8bdaf471555&outputschema=urn%3Aoasis%3Anames%3Atc%3Aebxml-regrep%3Axsd%3Arim%3A3.0&elementsetname=full",
//     },
//     {
//       extension: "xml",
//       link_type: "metadata",
//       name: "FGDC",
//       mime: "text/xml",
//       url: "https://stable.demo.geonode.org/catalogue/csw?request=GetRecordById&service=CSW&version=2.0.2&id=bfd94a65-0817-40cf-bb52-f8bdaf471555&outputschema=http%3A%2F%2Fwww.opengis.net%2Fcat%2Fcsw%2Fcsdgm&elementsetname=full",
//     },
//     {
//       extension: "xml",
//       link_type: "metadata",
//       name: "ISO",
//       mime: "text/xml",
//       url: "https://stable.demo.geonode.org/catalogue/csw?request=GetRecordById&service=CSW&version=2.0.2&id=bfd94a65-0817-40cf-bb52-f8bdaf471555&outputschema=http%3A%2F%2Fwww.isotc211.org%2F2005%2Fgmd&elementsetname=full",
//     },
//     {
//       extension: "xml",
//       link_type: "metadata",
//       name: "ISO with XSL",
//       mime: "text/xml",
//       url: "https://stable.demo.geonode.org/showmetadata/xsl/15148",
//     },
//     {
//       extension: "gpkg",
//       link_type: "data",
//       name: "gaza_strip_geobackeg",
//       mime: "",
//       url: "https://stable.demo.geonode.org/api/v2/assets/9172/link",
//       extras: {
//         type: "asset",
//         content: {
//           title: "Original",
//           description: null,
//           type: "gpkg",
//           download_url:
//             "https://stable.demo.geonode.org/api/v2/assets/9172/download",
//         },
//       },
//     },
//     {
//       extension: "jpg",
//       link_type: "image",
//       name: "JPEG",
//       mime: "image/jpeg",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WMS&request=GetMap&layers=geonode%3Agaza_strip_geobackeg&format=image%2Fjpeg&height=550&width=550&srs=EPSG%3A4326&bbox=34.2194300%2C31.2259417%2C34.5667758%2C31.5948971",
//     },
//     {
//       extension: "pdf",
//       link_type: "image",
//       name: "PDF",
//       mime: "application/pdf",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WMS&request=GetMap&layers=geonode%3Agaza_strip_geobackeg&format=application%2Fpdf&height=550&width=550&srs=EPSG%3A4326&bbox=34.2194300%2C31.2259417%2C34.5667758%2C31.5948971",
//     },
//     {
//       extension: "png",
//       link_type: "image",
//       name: "PNG",
//       mime: "image/png",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WMS&request=GetMap&layers=geonode%3Agaza_strip_geobackeg&format=image%2Fpng&height=550&width=550&srs=EPSG%3A4326&bbox=34.2194300%2C31.2259417%2C34.5667758%2C31.5948971",
//     },
//     {
//       extension: "zip",
//       link_type: "data",
//       name: "Zipped Shapefile",
//       mime: "SHAPE-ZIP",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=geonode%3Agaza_strip_geobackeg&outputFormat=SHAPE-ZIP&srs=EPSG%3A4326&format_options=charset%3AUTF-8",
//     },
//     {
//       extension: "gml",
//       link_type: "data",
//       name: "GML 2.0",
//       mime: "gml2",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=geonode%3Agaza_strip_geobackeg&outputFormat=gml2&srs=EPSG%3A4326",
//     },
//     {
//       extension: "gml",
//       link_type: "data",
//       name: "GML 3.1.1",
//       mime: "text/xml; subtype=gml/3.1.1",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=geonode%3Agaza_strip_geobackeg&outputFormat=text%2Fxml%3B+subtype%3Dgml%2F3.1.1&srs=EPSG%3A4326",
//     },
//     {
//       extension: "csv",
//       link_type: "data",
//       name: "CSV",
//       mime: "csv",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=geonode%3Agaza_strip_geobackeg&outputFormat=csv&srs=EPSG%3A4326",
//     },
//     {
//       extension: "excel",
//       link_type: "data",
//       name: "Excel",
//       mime: "excel",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=geonode%3Agaza_strip_geobackeg&outputFormat=excel&srs=EPSG%3A4326",
//     },
//     {
//       extension: "json",
//       link_type: "data",
//       name: "GeoJSON",
//       mime: "json",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=geonode%3Agaza_strip_geobackeg&outputFormat=json&srs=EPSG%3A4326&srsName=EPSG%3A4326",
//     },
//     {
//       extension: "html",
//       link_type: "html",
//       name: "geonode:gaza_strip_geobackeg",
//       mime: "text/html",
//       url: "https://stable.demo.geonode.org/catalogue/#/dataset/15148",
//     },
//     {
//       extension: "png",
//       link_type: "image",
//       name: "Legend",
//       mime: "image/png",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image/png&WIDTH=20&HEIGHT=20&LAYER=geonode:gaza_strip_geobackeg&STYLE=polygon&version=1.3.0&sld_version=1.1.0&legend_options=fontAntiAliasing:true;fontSize:12;forceLabels:on",
//     },
//     {
//       extension: "html",
//       link_type: "OGC:WMS",
//       name: "OGC WMS: geonode Service",
//       mime: "text/html",
//       url: "https://stable.demo.geonode.org/geoserver/ows",
//     },
//     {
//       extension: "html",
//       link_type: "OGC:WFS",
//       name: "OGC WFS: geonode Service",
//       mime: "text/html",
//       url: "https://stable.demo.geonode.org/geoserver/ows",
//     },
//     {
//       extension: "png",
//       link_type: "image",
//       name: "Legend",
//       mime: "image/png",
//       url: "https://stable.demo.geonode.org/geoserver/ows?service=WMS&request=GetLegendGraphic&format=image/png&WIDTH=20&HEIGHT=20&LAYER=geonode:gaza_strip_geobackeg&STYLE=gaza_strip_geobackeg&version=1.3.0&sld_version=1.1.0&legend_options=fontAntiAliasing:true;fontSize:12;forceLabels:on",
//     },
//     {
//       extension: "png",
//       link_type: "image",
//       name: "Thumbnail",
//       mime: "image/png",
//       url: "https://stable.demo.geonode.org/uploaded/thumbs/dataset-bfd94a65-0817-40cf-bb52-f8bdaf471555-thumb-5fb5330a-f420-4000-bee4-6aa5491f912d.jpg",
//     },
//   ],
//   link: "https://stable.demo.geonode.org/api/v2/resources/15148",
//   metadata_uploaded_preserve: false,
// };

// console.log("listaRecursos.value", listaRecursos.value);
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

//     // console.log(
//     //   "Copia de los Recursos filtrados en la vista",
//     //   recursosFiltrados.value
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
          <!-- <div v-if="pending">...cargando</div> -->
          <!-- <div v-else> -->
          <div>
            <button @click="refresh">Refresh data</button>
            <div class="flex">
              listaRecursosV2:
              {{ listaRecursosV2 }}
            </div>
            <div class="flex">
              listaRecursos:
              {{ listaRecursos }}
            </div>
            <!-- <div class="flex">
              {{ catalogoInfo.dataset }}
              catalogoInfo.dataset.resources:
              <b
                v-for="recurso in catalogoInfo.dataset.resources"
                :key="recurso.title"
              >
                {{ recurso.resource_type }}
              </b>
            </div> -->
            <!-- <div class="flex">
              catalogoInfo.document.resources:
              <b
                v-for="recurso in catalogoInfo.document.resources"
                :key="recurso.title"
              >
                {{ recurso.resource_type }}
              </b>
            </div> -->
            <div class="flex">
              <!-- listaRecursos recurso.resource_type: -->
              <!-- <b v-for="recurso in listaRecursos" :key="recurso.title">
                {{ recurso.resource_type }}
              </b> -->
            </div>
            <!-- {{ data }} -->
            <!-- <div>datosUseFetch.resources: {{ datosUseFetch.resources }}</div> -->
            <!-- <div class="flex">
              listaRecursos recurso.resource_type:
              <b
                v-for="recurso in datosUseFetch.resources"
                :key="recurso.title"
              >
                {{ recurso.title }}
              </b>
            </div> -->
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
