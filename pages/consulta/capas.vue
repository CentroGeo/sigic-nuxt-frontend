<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { exportarHTMLComoPNG } from '@centrogeomx/sisdai-mapas/funciones';
import { findServer, resourceTypeDic } from '~/utils/consulta';

const storeConsulta = useConsultaStore();
const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();
const { gnoxyFetch } = useGnoxyUrl();
const route = useRoute();
const router = useRouter();
storeConsulta.resourceType = resourceTypeDic.dataLayer;

const vistaDelMapa = ref({ extension: storeConsulta.mapExtent });

const linkExportaMapa = ref();
function exportarMapa() {
  exportarHTMLComoPNG(
    document.querySelectorAll('.mapa .ol-viewport').item(0),
    linkExportaMapa.value
  );
}

/**
 * Agrega en un parametro hash los valores de la vista del mapa
 * @param param vista del mapa
 */
function actualizarHashDesdeVista({ acercamiento, centro }) {
  const hash = `#vista=${acercamiento.toFixed(0)}/${centro[1].toFixed(4)}/${centro[0].toFixed(4)}`;

  if (hash !== route.hash) {
    router.replace({ query: route.query, hash });
  }
}

/**
 * Actualiza la vista del mapa dependiendo del hash.
 * @param hashVista texto hash sin el carácter #.
 */
function updateMapFromHash(hashVista) {
  if (hashVista === '') return;

  const [acercamiento, latitud, longitud] = hashVista.split('=')[1].split('/');
  storeConsulta.mapExtent = undefined;
  vistaDelMapa.value = { acercamiento, centro: [longitud, latitud] };
}
/**
 * Actualiza el queryParam.
 * @param newQueryParam para asignar.
 */
function updateQueryParam(capas) {
  if (capas !== route.query.capas) {
    router.replace({ query: { capas }, hash: route.hash });
  }
}
watch(() => storeSelected.asQueryParam(), updateQueryParam);
watch(
  () => storeConsulta.mapExtent,
  (extension) => {
    if (extension === undefined) return;
    vistaDelMapa.value = { extension };
  }
);
onMounted(async () => {
  storeResources.resetByType(storeConsulta.resourceType);
  updateMapFromHash(route.hash?.slice(1));
  storeSelected.addFromQueryParam(route.query.capas);

  // Para cuando hace el cambio de página
  if (storeSelected.pks.length > 0) {
    updateQueryParam(storeSelected.asQueryParam());
    storeSelected.pks.forEach((pk) => storeResources.fetchResourceByPk(pk));
  }
});

// const attributos = reactive({});
// async function addAttribute(pk) {
//   attributos[pk] = [];

//   try {
//     const { attributes } = await fetch(
//       `${config.public.geonodeApi}/datasets/${pk}/attribute_set`
//     ).then((response) => response.json());
//     // console.log(attributes);

//     const etiquetas = {};
//     const columnas = attributes
//       .filter((a) => a.visible)
//       .sort((a, b) => a.display_order - b.display_order)
//       .map(({ attribute, attribute_label }) => {
//         etiquetas[attribute] = attribute_label || attribute;
//         return attribute;
//       });
//     // console.log(columnas);

//     attributos[pk] = {
//       params: {
//         propertyName: columnas.join(','),
//       },
//       // attribute_label
//       contenido: (data) =>
//         columnas
//           .map((columna) => `<p><b>${etiquetas[columna] || columna}</b>: ${data[columna]}</p>`)
//           .join(''),
//     };
//     // console.log(attributos[pk]);
//   } catch (error) {
//     console.error('Error en la búsqueda:', error);

//     console.error(
//       'Ocurrió un problema al realizar la búsqueda. Por favor, verifica tu conexión o intenta de nuevo más tarde.'
//     );

//     if (error.response && error.response.status === 400) {
//       console.error('Los parámetros de búsqueda no son válidos. Revisa los filtros ingresados.');
//     } else if (error.response && error.response.status === 500) {
//       console.error('El servidor encontró un problema. Intenta más tarde.');
//     }
//   }
// }

// watch(
//   () => storeSelected.selectedResources[resourceType],
//   (nv_) => {
//     randomNum.value += Math.random();

//     const arr1 = nv_.map((r) => r.pk);
//     const arr2 = Object.keys(attributos);
//     // console.log(arr1, arr2);

//     const nv = arr1.filter((item) => !arr2.includes(item));
//     // console.log("Se agregó:", nv);
//     nv.forEach((r) => addAttribute(r));

//     //const ov = arr2.filter((item) => !arr1.includes(item));
//     // console.log("Se quitó:", ov);

//     //ov.forEach((resource) => delete attributos[resource]);

//     // console.log(attributos);

//     //console.log();
//   },
//   { deep: true }
// );

// api/v2/datasets?page_size=1&filter{alternate.in}[]=alternate
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo titulo="Capas geográficas" etiqueta-elementos="Capas" />
    </template>

    <template #visualizador>
      <template v-if="storeResources.isLoading">Cargando...</template>

      <ClientOnly>
        <SisdaiMapa
          class="gema"
          :vista="vistaDelMapa"
          @click-centrar="storeConsulta.resetMapExtent"
          @al-mover-vista="actualizarHashDesdeVista"
        >
          <SisdaiCapaXyz :posicion="0" />

          <SisdaiCapaWms
            v-for="resource in storeResources.findResources(storeSelected.pks)"
            :key="`wms-${resource.pk}`"
            :capa="resource.alternate"
            :consulta="gnoxyFetch"
            :fuente="findServer(resource)"
            :opacidad="storeSelected.byPk(resource.pk).opacidad"
            :posicion="storeSelected.byPk(resource.pk).posicion + 1"
            :visible="storeSelected.byPk(resource.pk).visible"
          />
        </SisdaiMapa>
      </ClientOnly>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Capas seleccionadas"
        :resource-type="storeConsulta.resourceType"
        etiqueta-elementos="Capas"
        :funcion-descarga="exportarMapa"
      />
      <a ref="linkExportaMapa" class="oculto" download="sigic.png" />
    </template>
  </ConsultaLayoutPaneles>
</template>
