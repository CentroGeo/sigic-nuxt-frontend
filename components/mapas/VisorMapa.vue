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

function alMoverVista({ acercamiento, centro }) {
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

const mapaRef = ref(null);
const contenedorRef = ref(null);
const latRef = ref(null);
const lngRef = ref(null);
defineExpose({ mapaRef });

const {
  createScaleLineControl,
  addControlsToMap,
  setupMousePositionTracking,
  setupMouseLeaveHandler,
  cleanup,
} = useMapControls(() => mapaRef.value?.mapa ?? null);

let inicializado = false;
function inicializar() {
  if (inicializado) return;
  if (!mapaRef.value?.mapa || !contenedorRef.value || !latRef.value || !lngRef.value) return;
  inicializado = true;
  createScaleLineControl();
  addControlsToMap();
  setupMousePositionTracking(latRef.value, lngRef.value);
  setupMouseLeaveHandler(contenedorRef.value);
}

onMounted(() => {
  inicializar();
});

watch(
  () => mapaRef.value?.mapa,
  () => {
    inicializar();
  }
);

onUnmounted(() => {
  cleanup();
});

const baseLayerUrls = {
  osm: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  carto: 'https://{a-c}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
  carto_dark: 'https://{a-c}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

// Capa base mostrada. Inicia con la guardada; el control permite cambiarla de
// forma momentanea (no se persiste, se reinicia al refrescar la pagina).
const baseLayerActual = ref(props.mapa.base_layer || 'osm');

watch(
  () => props.mapa.base_layer,
  (v) => {
    baseLayerActual.value = v || 'osm';
  }
);

const baseLayerUrl = computed(() => baseLayerUrls[baseLayerActual.value] || baseLayerUrls.osm);

const vista = computed(() => ({
  centro: [props.mapa.center_lat, props.mapa.center_long],
  acercamiento: props.mapa.zoom,
}));

const wmsFuente = computed(() => `${config.public.geoserverUrl}/wms?`);

const capasOrdenadas = computed(() =>
  [...props.capas].sort((a, b) => a.stack_order - b.stack_order)
);

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
    <div ref="contenedorRef" class="visor-mapa-contenedor" :style="estiloControles">
      <SisdaiMapa
        ref="mapaRef"
        class="visor-mapa gema"
        :vista="vista"
        :escala-grafica="false"
        @al-mover-vista="alMoverVista"
      >
        <SisdaiCapaXyz :key="`base-${baseLayerActual}`" :posicion="0" :fuente="baseLayerUrl" />

        <template v-for="capa in capasOrdenadas" :key="capa.id">
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

        <slot />
      </SisdaiMapa>

      <MapasControlInfo :titulo="mapa.name" />

      <MapasControlCapaBase v-model="baseLayerActual" />

      <MapasLeyendaMapa :capas="capasOrdenadas" :geoserver-url="config.public.geoserverUrl" />

      <div class="visor-coords">
        Lat: <span ref="latRef">---</span> · Lng: <span ref="lngRef">---</span>
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.visor-mapa-contenedor {
  position: relative;
  width: 100%;
  height: 100%;
}

.visor-mapa {
  height: 100%;
  width: 100%;
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

.visor-mapa-contenedor :deep(.sisdai-mapa-control-boton),
.visor-mapa-contenedor :deep(.sisdai-mapa-control button) {
  background-color: var(--boton-mapa-fondo) !important;
  color: var(--boton-mapa-texto) !important;
  border-color: var(--boton-mapa-fondo) !important;
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
