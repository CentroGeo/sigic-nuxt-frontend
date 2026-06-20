<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';
import { useMapControls } from '~/composables/useMapControls';
import { colorContraste } from '~/utils/color';

const props = defineProps({
  mapa: {
    type: Object,
    required: true,
  },
  capas: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['vista']);

function emitirVista({ acercamiento, centro }) {
  if (!Array.isArray(centro) || centro.length < 2) return;
  emit('vista', {
    zoom: acercamiento,
    center_lat: centro[0],
    center_long: centro[1],
  });
}

const config = useRuntimeConfig();
const { gnoxyFetch } = useGnoxyUrl();

// Teselas: capas públicas se piden directo a GeoServer (sin el proxy Nitro) →
// más rápido. Las privadas van por gnoxy (inyecta auth).
// Nota: el fetch directo requiere CORS habilitado en GeoServer.
const fetchDirecto = (url) => fetch(url);
function consultaCapa(capa) {
  return capa.dataset_is_published === true ? fetchDirecto : gnoxyFetch;
}
const mapasStore = useMapasStore();

const mapaIzqRef = ref(null);
const mapaDerRef = ref(null);
const contenedorIzqRef = ref(null);
const contenedorDerRef = ref(null);
const latIzqRef = ref(null);
const lngIzqRef = ref(null);
const latDerRef = ref(null);
const lngDerRef = ref(null);
defineExpose({ mapaIzqRef, mapaDerRef });

const controlesIzq = useMapControls(() => mapaIzqRef.value?.mapa ?? null);
const controlesDer = useMapControls(() => mapaDerRef.value?.mapa ?? null);

let initIzq = false;
let initDer = false;
function inicializarIzq() {
  if (initIzq) return;
  if (!mapaIzqRef.value?.mapa || !contenedorIzqRef.value || !latIzqRef.value || !lngIzqRef.value)
    return;
  console.warn('[VisorDual] inicializar controles izq');
  initIzq = true;
  controlesIzq.createScaleLineControl();
  controlesIzq.addControlsToMap();
  controlesIzq.setupMousePositionTracking(latIzqRef.value, lngIzqRef.value);
  controlesIzq.setupMouseLeaveHandler(contenedorIzqRef.value);
}
function inicializarDer() {
  if (initDer) return;
  if (!mapaDerRef.value?.mapa || !contenedorDerRef.value || !latDerRef.value || !lngDerRef.value)
    return;
  console.warn('[VisorDual] inicializar controles der');
  initDer = true;
  controlesDer.createScaleLineControl();
  controlesDer.addControlsToMap();
  controlesDer.setupMousePositionTracking(latDerRef.value, lngDerRef.value);
  controlesDer.setupMouseLeaveHandler(contenedorDerRef.value);
}

onMounted(() => {
  inicializarIzq();
  inicializarDer();
});
watch(() => mapaIzqRef.value?.mapa, inicializarIzq);
watch(() => mapaDerRef.value?.mapa, inicializarDer);

onUnmounted(() => {
  controlesIzq.cleanup();
  controlesDer.cleanup();
});

const baseLayerUrls = {
  osm: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  carto: 'https://{a-c}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
  carto_dark: 'https://{a-c}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

// Capa base mostrada (compartida por ambos paneles). Inicia con la guardada; el
// control permite cambiarla de forma momentanea (no se persiste, se reinicia al
// refrescar la pagina).
const baseLayerActual = ref(props.mapa.base_layer || 'osm');

watch(
  () => props.mapa.base_layer,
  (v) => {
    baseLayerActual.value = v || 'osm';
  }
);

const baseLayerUrl = computed(() => baseLayerUrls[baseLayerActual.value] || baseLayerUrls.osm);

const wmsFuente = computed(() => `${config.public.geoserverUrl}/wms?`);

const vistaInicial = {
  centro: [props.mapa.center_lat, props.mapa.center_long],
  acercamiento: props.mapa.zoom,
};

const vistaIzq = ref({ ...vistaInicial });
const vistaDer = ref({ ...vistaInicial });

let sincronizando = false;

function sincronizarDesdeIzq({ acercamiento, centro }) {
  if (sincronizando) return;
  sincronizando = true;
  vistaDer.value = { acercamiento, centro };
  emitirVista({ acercamiento, centro });
  nextTick(() => {
    sincronizando = false;
  });
}

function sincronizarDesdeDer({ acercamiento, centro }) {
  if (sincronizando) return;
  sincronizando = true;
  vistaIzq.value = { acercamiento, centro };
  emitirVista({ acercamiento, centro });
  nextTick(() => {
    sincronizando = false;
  });
}

const capasOrdenadas = computed(() =>
  [...props.capas].sort((a, b) => a.stack_order - b.stack_order)
);

const capasIzq = computed(() => capasOrdenadas.value.filter((l) => l.map_position === 'left'));
const capasDer = computed(() => capasOrdenadas.value.filter((l) => l.map_position === 'right'));

const estiloControles = computed(() => {
  const bg = props.mapa.highlight_color || '#ff51ba';
  return {
    '--boton-mapa-fondo': bg,
    '--boton-mapa-fondo-hover': bg,
    '--boton-mapa-texto': colorContraste(bg),
  };
});
</script>

<template>
  <ClientOnly>
    <div class="visor-dual">
      <div ref="contenedorIzqRef" class="panel-mapa visor-mapa-contenedor" :style="estiloControles">
        <SisdaiMapa
          ref="mapaIzqRef"
          class="visor-mapa gema"
          :vista="vistaIzq"
          :escala-grafica="false"
          @al-mover-vista="sincronizarDesdeIzq"
        >
          <SisdaiCapaXyz :key="`base-${baseLayerActual}`" :posicion="0" :fuente="baseLayerUrl" />

          <template v-for="capa in capasIzq" :key="`izq-${capa.id}`">
            <SisdaiCapaWms
              v-if="capa.layer_type === 'wms'"
              :capa="capa.name"
              :fuente="wmsFuente"
              :consulta="consultaCapa(capa)"
              :estilo="capa.style || undefined"
              :opacidad="capa.opacity"
              :visible="capa.visible"
              :posicion="capa.stack_order"
              :mosaicos="true"
            />

            <MapasCapaTeselada
              v-else-if="capa.layer_type === 'wmts'"
              :id="`capa-${capa.id}`"
              :fuente-wmts="mapasStore.buildWmtsUrl(capa)"
              :fuente-wms="wmsFuente"
              :capa="capa.name"
              :estilo="capa.style || ''"
              :opacidad="capa.opacity"
              :visible="capa.visible"
              :posicion="capa.stack_order"
            />
          </template>

          <slot name="izquierdo" />
        </SisdaiMapa>
        <MapasControlInfo :titulo="mapa.name" />
        <MapasControlCapaBase v-model="baseLayerActual" />
        <MapasLeyendaMapa :capas="capasIzq" :geoserver-url="config.public.geoserverUrl" />
        <div class="visor-coords">
          Lat: <span ref="latIzqRef">---</span> · Lng: <span ref="lngIzqRef">---</span>
        </div>
      </div>

      <div ref="contenedorDerRef" class="panel-mapa visor-mapa-contenedor" :style="estiloControles">
        <SisdaiMapa
          ref="mapaDerRef"
          class="visor-mapa gema"
          :vista="vistaDer"
          :escala-grafica="false"
          @al-mover-vista="sincronizarDesdeDer"
        >
          <SisdaiCapaXyz :key="`base-${baseLayerActual}`" :posicion="0" :fuente="baseLayerUrl" />

          <template v-for="capa in capasDer" :key="`der-${capa.id}`">
            <SisdaiCapaWms
              v-if="capa.layer_type === 'wms'"
              :capa="capa.name"
              :fuente="wmsFuente"
              :consulta="consultaCapa(capa)"
              :estilo="capa.style || undefined"
              :opacidad="capa.opacity"
              :visible="capa.visible"
              :posicion="capa.stack_order"
              :mosaicos="true"
            />

            <MapasCapaTeselada
              v-else-if="capa.layer_type === 'wmts'"
              :id="`capa-${capa.id}`"
              :fuente-wmts="mapasStore.buildWmtsUrl(capa)"
              :fuente-wms="wmsFuente"
              :capa="capa.name"
              :estilo="capa.style || ''"
              :opacidad="capa.opacity"
              :visible="capa.visible"
              :posicion="capa.stack_order"
            />
          </template>

          <slot name="derecho" />
        </SisdaiMapa>
        <MapasControlCapaBase v-model="baseLayerActual" />
        <MapasLeyendaMapa :capas="capasDer" :geoserver-url="config.public.geoserverUrl" />
        <div class="visor-coords">
          Lat: <span ref="latDerRef">---</span> · Lng: <span ref="lngDerRef">---</span>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.visor-dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  width: 100%;
  height: 100%;
}

.panel-mapa {
  min-width: 0;
  height: 100%;
}

.visor-mapa-contenedor {
  position: relative;
  height: 100%;
}

.visor-coords {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 2;
  font-size: 0.75rem;
  font-family: monospace;
  background-color: rgba(255, 255, 255, 0.85);
  color: #222;
  padding: 4px 8px;
  border-radius: 6px;
  pointer-events: none;
}

.visor-mapa {
  height: 100%;
  width: 100%;
}

.visor-mapa-contenedor :deep(.sisdai-mapa-control-boton),
.visor-mapa-contenedor :deep(.sisdai-mapa-control button) {
  background-color: var(--boton-mapa-fondo) !important;
  color: var(--boton-mapa-texto) !important;
  border-color: none !important;
  // Quita el "borde" (box-shadow inset) de los controles primarios del mapa.
  --boton-primario-borde: transparent;
  --boton-primario-cursor-borde: transparent;
  --boton-primario-enfoque-borde: transparent;

  &:hover,
  &:focus-visible {
    background-color: var(--boton-mapa-fondo-hover) !important;
    color: var(--boton-mapa-texto) !important;
    filter: brightness(0.92);
  }

  span,
  i {
    color: var(--boton-mapa-texto) !important;
  }
}
</style>
