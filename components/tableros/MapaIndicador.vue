<script setup>
import { SisdaiCapaVectorial, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';

const config = useRuntimeConfig();

const props = defineProps({
  mapValues: {
    type: Object,
    default: null,
  },
  plotConfig: {
    type: Object,
    default: null,
  },
  layerIdField: {
    type: String,
    default: '',
  },
  layerName: {
    type: String,
    default: null,
  },
  bbox: {
    type: Array,
    default: null,
  },
  useFilter: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  rangoActivoColor: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['hover-rango']);

const leyendaMinimizada = ref(false);

const VISTA_DEFAULT = { centro: [-99.1332, 19.4326], acercamiento: 5 };

const mapaKey = computed(() => `${props.layerName || 'sin-capa'}-${(props.bbox || []).join(',')}`);

const vista = computed(() => {
  if (!props.bbox || props.bbox.length < 4) return VISTA_DEFAULT;
  const [minLon, minLat, maxLon, maxLat] = props.bbox;
  if (!isFinite(minLon) || !isFinite(minLat) || !isFinite(maxLon) || !isFinite(maxLat)) {
    return VISTA_DEFAULT;
  }
  const centro = [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
  const maxDiff = Math.max(maxLon - minLon, maxLat - minLat);
  const acercamiento =
    maxDiff > 0 ? Math.max(1, Math.min(16, Math.round(Math.log2(360 / maxDiff)) + 1)) : 5;
  return { centro, acercamiento };
});

const wfsUrl = computed(() => {
  if (!props.layerName) return null;
  const base = config.public.geoserverUrl;
  return (
    `${base}/ows?service=WFS&version=1.0.0&request=GetFeature` +
    `&typeName=${props.layerName}` +
    `&outputFormat=application%2Fjson` +
    `&srsName=EPSG%3A4326`
  );
});

function hexToRgba(hex, alpha) {
  const clean = (hex || '#cccccc').replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const estiloVectorial = computed(() => {
  if (!props.mapValues || !props.layerIdField) {
    return {
      'relleno-color': 'rgba(180,180,180,0.4)',
      'contorno-color': '#888888',
      'contorno-grosor': 1,
    };
  }

  const estilosCategorias = {};
  for (const [featureId, info] of Object.entries(props.mapValues)) {
    const isActive = !props.rangoActivoColor || info.color === props.rangoActivoColor;
    estilosCategorias[String(featureId)] = {
      'relleno-color': isActive ? info.color || '#cccccc' : hexToRgba(info.color, 0.45),
      'contorno-color': isActive && props.rangoActivoColor ? '#333333' : '#ffffff',
      'contorno-grosor': isActive && props.rangoActivoColor ? 2 : 0.8,
    };
  }

  return {
    'relleno-color': 'rgba(180,180,180,0.3)',
    'contorno-color': '#aaaaaa',
    'contorno-grosor': 1,
    categorias: {
      atributo: props.layerIdField,
      estilo: estilosCategorias,
    },
  };
});

const globoInformativo = computed(() => {
  if (!props.mapValues) return undefined;
  return (featureProps) => {
    const fid = String(featureProps[props.layerIdField] ?? '');
    const nombre = featureProps.nomgeo || featureProps.NOMGEO || featureProps.nombre_entidad || fid;
    const info = props.mapValues?.[fid];
    const valor = info?.value ?? 'N/D';
    return `<strong>${nombre}</strong><br/>${valor}`;
  };
});
</script>

<template>
  <ClientOnly>
    <div class="mapa-indicador">
      <SisdaiMapa :key="mapaKey" class="gema" :vista="vista">
        <SisdaiCapaXyz :posicion="0" />

        <SisdaiCapaVectorial
          v-if="wfsUrl"
          :fuente="wfsUrl"
          :estilo="estiloVectorial"
          :globo-informativo="globoInformativo"
          :posicion="1"
        />
      </SisdaiMapa>

      <div v-if="plotConfig?.ranges" class="mapa-indicador__leyenda">
        <button
          class="mapa-indicador__leyenda-toggle"
          :aria-expanded="!leyendaMinimizada"
          @click="leyendaMinimizada = !leyendaMinimizada"
        >
          <span>{{ plotConfig.title || 'Leyenda' }}</span>
          <span class="mapa-indicador__leyenda-icono">{{ leyendaMinimizada ? '▸' : '▾' }}</span>
        </button>

        <ul v-if="!leyendaMinimizada" class="mapa-indicador__leyenda-lista">
          <li
            v-for="(rango, idx) in plotConfig.ranges"
            :key="idx"
            class="mapa-indicador__leyenda-item"
            :class="{ 'mapa-indicador__leyenda-item--activo': rango.color === rangoActivoColor }"
            @mouseenter="emit('hover-rango', rango.color)"
            @mouseleave="emit('hover-rango', null)"
          >
            <span class="mapa-indicador__leyenda-color" :style="{ backgroundColor: rango.color }" />
            <span>{{ rango.alias || rango.label || `${rango.min} - ${rango.max}` }}</span>
          </li>
        </ul>
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.mapa-indicador {
  position: relative;
  width: 100%;
  min-height: 520px;

  .gema {
    width: 100%;
    height: 520px;
  }

  &__leyenda {
    position: absolute;
    bottom: 2.5rem;
    left: 0.5rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 6px;
    font-size: 0.8rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    max-width: 210px;
    z-index: 10;
    overflow: hidden;
  }

  &__leyenda-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    color: inherit;
    gap: 0.5rem;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &__leyenda-icono {
    font-size: 0.7rem;
    flex-shrink: 0;
  }

  &__leyenda-lista {
    list-style: none;
    margin: 0;
    padding: 0 0.75rem 0.5rem;
    max-height: 200px;
    overflow-y: auto;
  }

  &__leyenda-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.2rem 0.25rem;
    border-radius: 3px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover,
    &--activo {
      background: rgba(0, 0, 0, 0.06);
    }
  }

  &__leyenda-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    flex-shrink: 0;
    transition: box-shadow 0.15s;
  }

  &__leyenda-item--activo &__leyenda-color {
    box-shadow: 0 0 0 2px #333;
  }
}
</style>
