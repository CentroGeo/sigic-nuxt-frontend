<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa, utiles } from '@centrogeomx/sisdai-mapas';
import { arrayNewsOlds, findServer, resourceTypeDic } from '~/utils/consulta';

const storeConsulta = useConsultaStore();
const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();
const { gnoxyFetch } = useGnoxyUrl();
const route = useRoute();
const router = useRouter();
storeConsulta.resourceType = resourceTypeDic.dataLayer;
const isSwipeActive = computed(() => storeConsulta.divisionMapaActivado());

const vistaDelMapa = ref({ extension: storeConsulta.mapExtent });
const selectorDivisionAbierto = ref(undefined);
const estaAbiertoSelectorDivisionMapa = (lado) => selectorDivisionAbierto.value === lado;
function alAbrirSelectorDivisionMapa(lado) {
  selectorDivisionAbierto.value = estaAbiertoSelectorDivisionMapa(lado) ? undefined : lado;
}

const attributos = reactive({});
const linkExportaMapa = ref();
function exportarMapa() {
  utiles.exportarHTMLComoPNG(
    document.querySelectorAll('.mapa .ol-viewport').item(0),
    linkExportaMapa.value
  );
}

/**
 * Agrega en un parametro hash los valores de la vista del mapa
 * @param param vista del mapa
 */
function actualizarHashDesdeVista({ acercamiento, centro }) {
  const hash = `#vista=${acercamiento.toFixed(0)}/${centro[1].toFixed(4)}/${centro[0].toFixed(4)}/${isSwipeActive.value}`;

  if (hash !== route.hash) {
    router.replace({ query: route.query, hash });
  }
}

/**
 * Actualiza el estatus del selector de swipe
 */
async function actualizarSwipeEnHash() {
  const hashList = route.hash.split('/');
  hashList[3] = isSwipeActive.value.toString();
  const newHash = hashList.join('/');
  await nextTick();
  router.replace({ query: route.query, hash: newHash });
}

/**
 * Actualiza la vista del mapa dependiendo del hash.
 * @param hashVista texto hash sin el carácter #.
 */
function updateMapFromHash(hashVista) {
  if (hashVista === '') return;
  const [acercamiento, latitud, longitud, swipe] = hashVista.split('=')[1].split('/');
  storeConsulta.mapExtent = undefined;
  vistaDelMapa.value = { acercamiento, centro: [longitud, latitud] };
  if (swipe === 'true') {
    storeConsulta.activarDivisionMapa();
  } else {
    storeConsulta.desactivarDivisionMapa();
  }
}
/**
 * Actualiza el queryParam.
 * @param newQueryParam para asignar.
 */
async function updateQueryParam(capas) {
  const hashList = route.hash.split('/');
  hashList[3] = isSwipeActive.value.toString();
  const newHash = hashList.join('/');
  await nextTick();
  if (capas !== route.query.capas) {
    router.replace({ query: { capas }, hash: newHash });
  }
}
watch(isSwipeActive, async (nv) => {
  await actualizarSwipeEnHash();
  if (nv === false) {
    await nextTick();
    storeSelected.pks.forEach((pk) => storeSelected.byPk(pk).resetLado());
  }
});
watch(() => storeSelected.asQueryParam(), updateQueryParam, { deep: true });
watch(
  () => storeConsulta.mapExtent,
  (extension) => {
    if (extension === undefined) return;
    vistaDelMapa.value = { extension };
  }
);

onMounted(async () => {
  //console.log('Extension:', vistaDelMapa.value);
  updateMapFromHash(route.hash?.slice(1));
  storeResources.resetByType(storeConsulta.resourceType);
  storeSelected.addFromQueryParam(route.query.capas);

  // Para cuando hace el cambio de página
  if (storeSelected.pks.length > 0) {
    storeResources.fetchResourcesByPk(storeConsulta.resourceType, storeSelected.pks);
    updateQueryParam(storeSelected.asQueryParam());
  }
});

async function addAttribute(pk) {
  attributos[pk] = [];
  const resource = await storeResources.fetchResourceByPk(pk);
  if (resource.sourcetype === 'REMOTE') {
    attributos[pk] = {
      params: {
        propertyName: '',
      },
      contenido: () =>
        `<p style="font-weight: bold">${resource.title}</p> <p>No hay información disponible para esta capa</p>`,
    };
  } else {
    const { columnas, etiquetas } = await storeResources.fetchAttrs(pk);
    attributos[pk] = {
      params: {
        propertyName: columnas.join(','),
      },
      contenido: (data) =>
        `<p style="font-weight: bold">${resource.title}</p>` +
        columnas
          .map((columna) => `<p><b>${etiquetas[columna] || columna}</b>: ${data[columna]}</p>`)
          .join(''),
    };
  }
}

watch(
  () => storeSelected.resources[storeConsulta.resourceType],
  (nv_) => {
    const selectedPks = Object.keys(nv_);
    const attributesPks = Object.keys(attributos);
    const { news, olds } = arrayNewsOlds(attributesPks, selectedPks);
    news.forEach((r) => addAttribute(r));
    olds.forEach((resource) => delete attributos[resource]);
  },
  { deep: true }
);

// api/v2/datasets?page_size=1&filter{alternate.in}[]=alternate
// const contenedorSelectoresDivisionColapsado = ref(true);
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo titulo="Capas geográficas" etiqueta-elementos="Capas" />
    </template>

    <template #visualizador>
      <div v-if="storeSelected.pks.length === 0" class="contenedor">
        <ConsultaTarjetaSinSeleccion />
      </div>
      <ClientOnly v-else>
        <SisdaiMapa
          class="gema"
          :vista="vistaDelMapa"
          :dividir="storeConsulta.divisionMapa"
          @click-centrar="storeConsulta.resetMapExtent"
          @al-mover-vista="actualizarHashDesdeVista"
        >
          <div
            class="selectores-division-contenedor fondo-color-neutro borde-redondeado-4"
            :class="{
              colapsado: !(
                storeConsulta.contenedorSelectoresDivisionColapsado &&
                storeConsulta.divisionMapaActivado()
              ),
            }"
          >
            <ConsultaSelectorDivisionMapa
              :abierto="estaAbiertoSelectorDivisionMapa(utiles.capa.lados.derecho)"
              :lado="utiles.capa.lados.derecho"
              @al-abrir="alAbrirSelectorDivisionMapa"
            />
            <ConsultaSelectorDivisionMapa
              :abierto="estaAbiertoSelectorDivisionMapa(utiles.capa.lados.izquierdo)"
              :lado="utiles.capa.lados.izquierdo"
              @al-abrir="alAbrirSelectorDivisionMapa"
            />
          </div>

          <SisdaiCapaXyz :posicion="0" />

          <SisdaiCapaWms
            v-for="resource in storeResources.findResources(storeSelected.pks)"
            :key="`wms-${resource.pk}-${resource.position_}`"
            :capa="resource.alternate"
            :consulta="gnoxyFetch"
            :fuente="findServer(resource)"
            :lado="storeSelected.byPk(resource.pk).lado"
            :mosaicos="true"
            :opacidad="storeSelected.byPk(resource.pk).opacidad"
            :posicion="storeSelected.byPk(resource.pk).posicion + 1"
            :visible="storeSelected.byPk(resource.pk).visible"
            :cuadro-informativo="attributos[resource.pk]"
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

<style lang="scss" scoped>
.selectores-division-contenedor {
  z-index: 2;
  right: 0;
  top: 160px;
  position: absolute;

  cursor: inherit;
  pointer-events: inherit;
  opacity: 1;
  max-width: 260px;

  &.colapsado {
    cursor: default;
    pointer-events: none;
    opacity: 0;
    max-width: 0;
    transition:
      opacity 0.27s ease,
      max-width 0.27s ease;
  }
}
</style>
