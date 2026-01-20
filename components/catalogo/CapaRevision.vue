<script setup>
import {
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiLeyendaWms,
  SisdaiMapa,
  utiles,
} from '@centrogeomx/sisdai-mapas';

import {
  arrayNewsOlds,
  categoriesInSpanish,
  findServer,
  hasWMS,
  resourceTypeDic,
  tooltipContent,
} from '~/utils/consulta';

const storeConsulta = useConsultaStore();
const storeResources = useResourcesConsultaStore();
const storeSelected = useSelectedResources2Store();
const config = useRuntimeConfig();
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

const attributes = ref({});
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

/**
 * Obtiene el attribute set de un recurso a partir del pk del mismo
 * @param pk
 */
async function addAttribute(pk) {
  const maxAttrs = 5;
  const resource = await gnoxyFetch(`${config.public.geonodeApi}/datasets/${pk}`);
  if (!resource.ok) {
    const alternateTitle = storeResources.findResource(pk, 'dataLayer')['alternate'];
    attributes.value[alternateTitle] = [];
  } else {
    const res = await resource.json();
    let visibleAttrs = res.dataset.attribute_set
      .filter((a) => a.visible)
      .sort((a, b) => a.display_order - b.display_order);

    // Limitamos el máximo de atributos visibles
    if (visibleAttrs.length > 0) {
      if (visibleAttrs.length > maxAttrs) {
        visibleAttrs = visibleAttrs.slice(0, maxAttrs);
      }
      attributes.value[res.dataset.alternate] = visibleAttrs;
    } else {
      attributes.value[res.dataset.alternate] = [];
    }
  }
}

/**
 * Crea la información del cuadro de información
 * @param url
 * @param alternate
 * @param title
 * @param sourcetype
 */
async function buildLayerInfo(url, alternate, title, sourcetype) {
  if (sourcetype === 'REMOTE') {
    return undefined;
  } else {
    const res = await gnoxyFetch(url);
    if (!res.ok) {
      return undefined;
    }
    const data = await res.json();
    if (data.features.length === 0) {
      return undefined;
    } else {
      const propiedades = data.features[0].properties;
      const match = attributes.value[alternate].map(({ attribute, attribute_label }) => {
        if (attribute_label) {
          return `<li class="m-0">${attribute_label}: ${propiedades[attribute]}</li>`;
        } else {
          return `<li class="m-0">${attribute}: ${propiedades[attribute]}</li>`;
        }
      });
      return `<p style="margin-bottom: 8px;">${title}</p> <ol style="margin-top: 8px">${match.join(
        ''
      )}</ol>`;
    }
  }
}

watch(
  () => storeSelected.resources[storeConsulta.resourceType],
  (nv_) => {
    const selectedPks = Object.keys(nv_);
    const attributesPks = Object.keys(attributes.value);
    const { news, olds } = arrayNewsOlds(attributesPks, selectedPks);
    news.forEach(async (r) => await addAttribute(r));
    olds.forEach((resource) => delete attributes.value[resource]);
  },
  { deep: true }
);

watch(() => storeSelected.asQueryParam(), updateQueryParam, { deep: true });
watch(isSwipeActive, async (nv) => {
  await actualizarSwipeEnHash();
  if (nv === false) {
    await nextTick();
    storeSelected.pks.forEach((pk) => storeSelected.byPk(pk).resetLado());
  }
});
watch(
  () => storeConsulta.mapExtent,
  (extension) => {
    if (extension === undefined) return;
    vistaDelMapa.value = { extension };
  }
);
const resourceElement = computed(() => storeResources.findResources(storeSelected.pks)[0] || {});

const shownModal = ref('ninguno');
const modalResource = ref(null);
const tablaChild = ref(null);
const opacityChild = ref(null);
const downloadOneChild = ref(null);

function notifyTablaChild(resource) {
  shownModal.value = 'tablaModal';
  modalResource.value = resource;
  nextTick(() => {
    tablaChild.value?.abrirModalTabla();
  });
}
function notifyDownloadOneChild(resource) {
  shownModal.value = 'downloadOne';
  modalResource.value = resource;
  nextTick(() => {
    downloadOneChild.value?.abrirModalDescarga();
  });
}
function changeModal(to) {
  if (to === 'downloadOne') {
    notifyDownloadOneChild(modalResource.value);
  }
}
function notifyOpacityChild(resource) {
  shownModal.value = 'opacityModal';
  modalResource.value = resource;
  nextTick(() => {
    opacityChild.value?.abrirModalOpacidad();
  });
}

const dividirMapa = computed({
  get: () => storeConsulta.divisionMapaActivado(),
  set(nuevValor) {
    if (nuevValor === true) storeConsulta.activarDivisionMapa();
    else storeConsulta.desactivarDivisionMapa();
  },
});

const { data } = useAuth();
const isLoggedIn = ref(data.value ? true : false);

const actualButtons = ref({});
const optionsButtons = ref([
  {
    excludeFor: 'none',
    label: 'Hacer zoom',
    pictogram: 'pictograma-zoom-instruccional',
    globo: 'Zoom a la capa',
    action: () => {
      storeConsulta.mapExtent = resourceElement.value.extent.coords.join(',');
    },
  },
  {
    excludeFor: 'noTables',
    label: 'Ver tablas',
    pictogram: 'pictograma-tabla',
    globo: 'Ver tabla',
    action: () => {
      notifyTablaChild(resourceElement.value);
    },
  },
  {
    excludeFor: 'none',
    label: 'Mostrar',
    get pictogram() {
      return storeSelected.byPk(resourceElement.value.pk)?.visible
        ? 'pictograma-ojo-ver'
        : 'pictograma-ojo-ocultar';
    },
    get globo() {
      return storeSelected.byPk(resourceElement.value.pk)?.visible
        ? 'Ocultar capa'
        : 'Mostrar capa';
    },
    action: () => {
      storeSelected.byPk(resourceElement.value.pk).toggleVisibility();
    },
  },
  {
    excludeFor: 'none',
    label: 'Cambiar opacidad',
    pictogram: 'pictograma-editar',
    globo: 'Opacidad',
    action: () => {
      notifyOpacityChild(resourceElement.value);
    },
  },
]);

async function updateFunctions() {
  let buttons = optionsButtons.value;
  if (resourceElement.value.subtype === 'raster') {
    buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
  }
  if (resourceElement.value.sourcetype === 'REMOTE') {
    // Se excluye el botón de descargar para remotos
    buttons = buttons.filter((d) => d.excludeFor !== 'remotes');
    const resourceHasWMS = await hasWMS(resourceElement.value, 'table');
    // Se excluye el botón para ver tablas en caso de que el archivo remoto no permita consultar la tabla
    if (resourceHasWMS === false) {
      buttons = buttons.filter((d) => d.excludeFor !== 'noTables');
    }
  }
  if (resourceElement.value.is_approved === false && resourceElement.value.is_published === false) {
    // Se excluye el botón OWS para recursos privados
    buttons = buttons.filter((d) => d.label !== 'Vínculo OWS');
  }
  actualButtons.value = buttons;
}
updateFunctions();

onMounted(async () => {
  storeConsulta.catalogoColapsado = true;

  updateMapFromHash(route.hash?.slice(1));
  storeResources.resetByType(storeConsulta.resourceType);
  storeSelected.addFromQueryParam(route.query.capas);

  // Para cuando hace el cambio de página
  if (storeSelected.pks.length > 0) {
    storeResources.fetchResourcesByPk(storeConsulta.resourceType, storeSelected.pks);
    updateQueryParam(storeSelected.asQueryParam());
  }
});
</script>

<template>
  <div>
    <h2>{{ resourceElement.title }}</h2>
    <ConsultaLayoutPaneles>
      <template #catalogo> </template>

      <template #visualizador>
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
              :cuadro-informativo="
                (url) =>
                  buildLayerInfo(url, resource.alternate, resource.title, resource.sourcetype)
              "
            />
          </SisdaiMapa>
        </ClientOnly>
      </template>

      <template #seleccion>
        <div class="seleccion-layout">
          <div class="encabeado-seleccion">
            <div class="m-x-2 m-y-1">
              <div class="flex m-y-3"></div>

              <div class="flex m-y-3">
                <button
                  v-globo-informacion:derecha="
                    storeConsulta.contenedorSelectoresDivisionColapsado ? 'Cerrar' : 'Abrir'
                  "
                  type="button"
                  class="boton-pictograma boton-con-contenedor-secundario"
                  :aria-label="
                    storeConsulta.contenedorSelectoresDivisionColapsado ? 'Cerrar' : 'Abrir'
                  "
                  :disabled="!dividirMapa"
                  style="align-self: center"
                  @click="
                    storeConsulta.contenedorSelectoresDivisionColapsado =
                      !storeConsulta.contenedorSelectoresDivisionColapsado
                  "
                >
                  <span
                    :class="`pictograma-angulo-${storeConsulta.contenedorSelectoresDivisionColapsado ? 'derecho' : 'izquierdo'}`"
                    aria-hidden="true"
                  />
                </button>

                <div class="contendor-control-dividir">
                  <input id="control-dividir" v-model="dividirMapa" type="checkbox" />
                  <label for="control-dividir"> Dividir pantalla </label>
                </div>
              </div>
            </div>
          </div>

          <div class="m-x-2 m-y-1">
            <div class="tarjeta m-y-1">
              <div class="tarjeta-selected fondo-color-acento">
                <div class="flex flex-contenido-separado m-0 encabezado-tarjeta">
                  <p v-if="resourceElement" class="tarjeta-texto-secundario m-0">
                    {{
                      resourceElement?.category
                        ? categoriesInSpanish[resourceElement?.category.gn_description]
                        : 'Sin Clasificar'
                    }}
                  </p>

                  <div class="m-0">
                    <button
                      v-globo-informacion:izquierda="{
                        contenido: tooltipContent(resourceElement || {}),
                        desfase: [0, 8],
                      }"
                      class="boton-pictograma boton-sin-contenedor-secundario"
                      aria-label="Mostrar información"
                      type="button"
                    >
                      <span class="pictograma-informacion pictograma-mediano" aria-hidden="true" />
                    </button>
                    <!-- <button
                    v-globo-informacion:derecha="'Subir elemento'"
                    class="boton-pictograma boton-sin-contenedor-secundario"
                    aria-label="Subir elemento"
                    type="button"
                    :disabled="storeSelected.pks.length === storeSelected.posicion + 1"
                    @click="goUp"
                  >
                    <span class="pictograma-subir-capa pictograma-mediano" aria-hidden="true" />
                  </button> -->
                    <!-- <button
                    v-globo-informacion:derecha="'Bajar elemento'"
                    class="boton-pictograma boton-sin-contenedor-secundario"
                    aria-label="Bajar Elemento"
                    type="button"
                    :disabled="storeSelected.posicion === 0"
                    @click="goDown"
                  >
                    <span class="pictograma-bajar-capa pictograma-mediano" aria-hidden="true" />
                  </button> -->
                  </div>
                </div>
                <div v-if="resourceElement">
                  <div
                    v-if="
                      isLoggedIn &&
                      resourceElement.is_approved === false &&
                      resourceElement.is_published === false
                    "
                    class="id-tag flex m-b-1 m-t-0"
                  >
                    <span class="pictograma-persona"></span>
                    Mis archivos
                  </div>
                  <div
                    v-if="resourceElement.sourcetype === 'REMOTE'"
                    class="id-tag flex m-b-1 m-t-0"
                  >
                    <span class="pictograma-colaborar"></span>
                    Catálogo externo
                  </div>
                </div>

                <div v-if="resourceElement.title">
                  <div class="m-y-2">
                    <SisdaiLeyendaWms
                      :consulta="gnoxyFetch"
                      :fuente="findServer(resourceElement)"
                      :nombre="resourceElement.alternate"
                      :titulo="resourceElement.title || 'cargando...'"
                      :sin-control="true"
                      :sin-control-clases="true"
                    />
                  </div>

                  <div v-if="resourceElement.title" class="flex flex-contenido-final">
                    <button
                      v-for="button in actualButtons"
                      :key="button.label"
                      v-globo-informacion:derecha="button.globo"
                      class="boton-pictograma boton-sin-contenedor-secundario"
                      :aria-label="button.label"
                      type="button"
                      @click="button.action"
                    >
                      <span :class="button.pictogram" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <div v-else class="flex flex-contenido-centrado">
                  <img src="/img/loader.gif" alt="...Cargando" height="50px" />
                </div>
              </div>
            </div>
          </div>

          <div id="los-modales">
            <ConsultaModalDescarga
              v-if="shownModal === 'downloadOne'"
              ref="downloadOneChild"
              :key="`descarga_${modalResource.pk}_${'dataLayer'}`"
              :resource-type="'dataLayer'"
              :selected-element="modalResource"
            />

            <CatalogoModalTabla
              v-if="shownModal === 'tablaModal'"
              ref="tablaChild"
              :key="`tabla_${modalResource.pk}_${'dataLayer'}`"
              :selected-element="modalResource"
              @notify-download="changeModal('downloadOne')"
            />

            <ConsultaModalOpacidad
              v-if="shownModal === 'opacityModal'"
              ref="opacityChild"
              :key="`opacidad_${modalResource.pk}_${'dataLayer'}`"
              :selected-element="modalResource"
            />
          </div>
        </div>
      </template>
    </ConsultaLayoutPaneles>
  </div>
</template>

<style lang="scss" scoped>
.gema {
  --altura-consulta-esc: calc(100vh - 112px);
  height: var(--altura-consulta-esc) !important;
}
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

.seleccion-layout {
  height: var(--altura-consulta-esc);
  overflow-y: auto;
  overflow-x: hidden;

  .encabeado-seleccion {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--fondo);
    padding-bottom: 8px;
  }
}

.tarjeta-selected {
  padding: 16px;
  color: var(--campo-etiqueta-color);

  .encabezado-tarjeta {
    align-items: center;
  }
}
.selected-unselected {
  padding: 16px;
  background-color: var(--color-neutro-1);
}
.id-tag {
  background-color: var(--fondo-acento);
  padding: 8px;
  border: solid 1px;
  border-radius: 8px;
  color: var(--campo-etiqueta-color);
  width: fit-content;
  align-items: left;
  gap: 8px;
}
.flex {
  gap: 8px;
}
</style>
