<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { exportarHTMLComoPNG } from '@centrogeomx/sisdai-mapas/funciones';
import { lados } from '@centrogeomx/sisdai-mapas/src/utiles/capa';
import { arrayNewsOlds, findServer, resourceTypeDic } from '~/utils/consulta';

const storeConsulta = useConsultaStore();
const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();
const { gnoxyFetch } = useGnoxyUrl();
const route = useRoute();
const router = useRouter();
storeConsulta.resourceType = resourceTypeDic.dataLayer;

const vistaDelMapa = ref({ extension: storeConsulta.mapExtent });
const selectorDivisionAbierto = ref(undefined);
const attributos = reactive({});
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
      contenido: () => `${pk} No hay información disponible para esta capa`,
    };
  } else {
    const { columnas, etiquetas } = await storeResources.fetchAttrs(pk);
    attributos[pk] = {
      params: {
        propertyName: columnas.join(','),
      },
      contenido: (data) =>
        pk +
        columnas
          .map((columna) => `<p><b>${etiquetas[columna] || columna}</b>: ${data[columna]}</p>`)
          .join(''),
    };
  }
  console.log('Los atributos:', attributos);
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
      <template v-if="storeResources.isLoading">Cargando...</template>

      <ClientOnly>
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
              :abierto="selectorDivisionAbierto === lados.derecho"
              :lado="lados.derecho"
              @al-abrir="
                selectorDivisionAbierto =
                  selectorDivisionAbierto === lados.derecho ? undefined : lados.derecho
              "
            />
            <ConsultaSelectorDivisionMapa
              :abierto="selectorDivisionAbierto === lados.izquierdo"
              :lado="lados.izquierdo"
              @al-abrir="
                selectorDivisionAbierto =
                  selectorDivisionAbierto === lados.izquierdo ? undefined : lados.izquierdo
              "
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
            :mosaicos="false"
            :opacidad="storeSelected.byPk(resource.pk).opacidad"
            :posicion="storeSelected.byPk(resource.pk).posicion + 1"
            :visible="storeSelected.byPk(resource.pk).visible"
            :cuadro-informativo="[resource.pk]"
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
