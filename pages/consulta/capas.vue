<script setup>
import { exportarHTMLComoPNG } from '@centrogeomx/sisdai-mapas/funciones';

const resourceType = 'dataLayer';

const extensionNacional = '-118.3651,14.5321,-86.7104,32.7187';
const storeConsulta = useConsultaStore();
const extensionMapa = computed(() => storeConsulta.ajustarExtensionMapa || extensionNacional);

const config = useRuntimeConfig();
const storeSelected = useSelectedResourcesStore();
const randomNum = ref(0);
const opacityDict = ref({});
const isFinishedLoading = ref(0);
const linkExportaMapa = ref();
function exportarMapa() {
  exportarHTMLComoPNG(
    document.querySelectorAll('.mapa .ol-viewport').item(0),
    linkExportaMapa.value
  );
}
const attributos = reactive({});
async function addAttribute(pk) {
  attributos[pk] = [];

  try {
    const { attributes } = await fetch(
      `${config.public.geonodeApi}/datasets/${pk}/attribute_set`
    ).then((response) => response.json());
    // console.log(attributes);

    const etiquetas = {};
    const columnas = attributes
      .filter((a) => a.visible)
      .sort((a, b) => a.display_order - b.display_order)
      .map(({ attribute, attribute_label }) => {
        etiquetas[attribute] = attribute_label || attribute;
        return attribute;
      });
    // console.log(columnas);

    attributos[pk] = {
      params: {
        propertyName: columnas.join(','),
      },
      // attribute_label
      contenido: (data) =>
        columnas
          .map((columna) => `<p><b>${etiquetas[columna] || columna}</b>: ${data[columna]}</p>`)
          .join(''),
    };
    // console.log(attributos[pk]);
  } catch (error) {
    console.error('Error en la búsqueda:', error);

    console.error(
      'Ocurrió un problema al realizar la búsqueda. Por favor, verifica tu conexión o intenta de nuevo más tarde.'
    );

    if (error.response && error.response.status === 400) {
      console.error('Los parámetros de búsqueda no son válidos. Revisa los filtros ingresados.');
    } else if (error.response && error.response.status === 500) {
      console.error('El servidor encontró un problema. Intenta más tarde.');
    }
  }
}

watch(
  () => storeSelected.selectedResources[resourceType],
  (nv_) => {
    randomNum.value += Math.random();

    const arr1 = nv_.map((r) => r.pk);
    const arr2 = Object.keys(attributos);
    // console.log(arr1, arr2);

    const nv = arr1.filter((item) => !arr2.includes(item));
    // console.log("Se agregó:", nv);
    nv.forEach((r) => addAttribute(r));

    //const ov = arr2.filter((item) => !arr1.includes(item));
    // console.log("Se quitó:", ov);

    //ov.forEach((resource) => delete attributos[resource]);

    // console.log(attributos);

    //console.log();
  },
  { deep: true }
);

// api/v2/datasets?page_size=1&filter{alternate.in}[]=alternate

/** * Revisión!
 */

/* function updateMapParams(centro, acercamiento) {
  storeSelected.setMapViewParams(centro, acercamiento);
} */

// Este watcher sirve para ajustar los índices de las capas montadas
// cuando estas terminan de cargarse pero solo funciona cuando recién se montan las capas.
/* watch(isFinishedLoading, () => {
  console.log('cuenta: ', isFinishedLoading.value);
  const resourcesNum = storeSelected.selectedResources[resourceType].length;
  if (resourcesNum === isFinishedLoading.value) {
    opacityDict.value = storeSelected.shownFiles.dataLayer.opacity;
    randomNum.value += 1;
    console.log('Dict opacidad', opacityDict.value);
  }
});
watch(
  () => storeSelected.shownFiles.dataLayer,
  () => {
    isFinishedLoading.value = 0;
    randomNum.value += 1;
    console.log('watcher en capas', storeSelected.shownFiles.dataLayer);
  },
  { deep: true }
); */

const route = useRoute();
const router = useRouter();
const selectedStore = useSelectedResources2Store();
const fetchedStore = useFetchedResourcesStore();
const vistaDelMapa = ref({ extension: extensionNacional });

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
function actualizarVistaDesdeHash(hashVista) {
  if (hashVista === '') return;

  const [acercamiento, latitud, longitud] = hashVista.split('=')[1].split('/');
  vistaDelMapa.value = { acercamiento, centro: [longitud, latitud] };
}

/**
 * Función ejecutada cuando se dá click en el botón centrar del mapa.
 */
function clickCentrar() {
  vistaDelMapa.value = { extension: extensionNacional };
}

/**
 * Actualiza el queryParam desde los valores del store.
 * @param queryParam generado por el store.
 */
function updateQueryFromStore(queryParam) {
  const query = { capas: queryParam };

  if (query.capas !== route.query.capas) {
    router.replace({ query, hash: route.hash });
  }
}
watch(() => selectedStore.resourcesAsQueryParam(resourceType), updateQueryFromStore);

/**
 * Actualiza el store desde los valores del queryParam.
 * @param queryParam que llega desde la url.
 */
function actualizarCapasDesdeQuery(queryParam) {
  selectedStore.addFromQueryParam(queryParam, resourceType);
}

onMounted(() => {
  actualizarVistaDesdeHash(route.hash?.slice(1));
  actualizarCapasDesdeQuery(route.query.capas);
});
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo
        :titulo="'Capas geográficas'"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
      />
    </template>

    <template #visualizador>
      <ClientOnly>
        <!-- <SisdaiMapa>
          <SisdaiCapaXyz />

          <SisdaiCapaWms
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :posicion="storeSelected.selectedResources.length - index"
            @alFinalizarCarga="isFinishedLoading += 1"
          />
        </SisdaiMapa> -->
<!--         <SisdaiMapa
          class="gema"
          :vista="vistaDelMapa"
          @click-centrar="clickCentrar"
          @al-mover-vista="actualizarHashDesdeVista"
        >
          <SisdaiCapaXyz />

          <SisdaiCapaWms
            v-for="resource in fetchedStore.findResources(
              selectedStore.resourcesList(resourceType),
              resourceType
            )"
            :key="`wms-${resource.uuid}`"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :capa="resource.alternate"
            :opacidad="resource.opacidad"
          />
        </SisdaiMapa> -->
      </ClientOnly>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Capas seleccionadas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
        :funcion-descarga="exportarMapa"
      />
      <a ref="linkExportaMapa" class="oculto" download="sigic.png" />
    </template>
  </ConsultaLayoutPaneles>
</template>
