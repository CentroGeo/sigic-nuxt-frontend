<script setup>
import {
  SisdaiCapaVectorial,
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';

const config = useRuntimeConfig();
// const { gnoxyUrl } = useGnoxyUrl();

const props = defineProps({
  capas: { type: Array, default: () => [] },
  vista: { type: Object, default: () => ({}) },
  marcadores: { type: Array, default: () => [] },
});

const emits = defineEmits(['clickVista', 'clickMarcador']);

const capa_marcadores = computed(() => ({
  type: 'FeatureCollection',
  features: props.marcadores.map((marcador) => ({
    type: 'Feature',
    properties: {
      id: marcador.id,
      title: marcador.title,
      content: marcador.content,
      icon: marcador.icon,
      color: marcador.color,
    },
    geometry: {
      type: 'Point',
      coordinates: [Number(marcador.lng), Number(marcador.lat)],
    },
  })),
}));

const tamanio_icono = 16;
const estilo_marcador = [
  {
    // triangulo
    'forma-angulo': Math.PI / 1,
    'forma-desplazamiento': [0, tamanio_icono],
    'forma-relleno-color': ['get', 'color'],
    'forma-puntos': 3,
    'forma-radio': tamanio_icono,
  },
  {
    // circulo
    'circulo-desplazamiento': [0, tamanio_icono * 2],
    'circulo-relleno-color': ['get', 'color'],
    'circulo-radio': tamanio_icono,
  },
  {
    // pictograma
    'circulo-desplazamiento': [0, tamanio_icono * 2],
    'circulo-relleno-color': 'white',
    'circulo-radio': tamanio_icono - tamanio_icono / 4,
    'texto-relleno-color': ['get', 'color'],
    'texto-tipografia': `${tamanio_icono + tamanio_icono / 4}px sisdai-pictogramas`,
    'texto-desplazar_en-y': -(tamanio_icono * 2) + 1,
    'texto-valor': ['get', 'icon'],
  },
];
const id_marcadores = '_marcadores_';

function clickVista({ coordenadas, capa, vector }) {
  emits('clickVista', { coordenadas });

  if (!capa) return;
  if (capa.id !== id_marcadores) return;

  emits(
    'clickMarcador',
    props.marcadores.find(({ id }) => vector.id === id)
  );
}
</script>

<template>
  <ClientOnly>
    <SisdaiMapa class="gema" :vista="vista" @click-vista="clickVista">
      <SisdaiCapaXyz
        fuente="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        :posicion="0"
      />

      <SisdaiCapaWms
        v-for="capa in capas"
        :key="`capa-${capa.name}-${capa.stack_order}`"
        :fuente="`${config.public.geoserverUrl}/ows`"
        :capa="capa.name"
        :opacidad="capa.opacity"
        :posicion="capa.stack_order"
        :visible="capa.visible"
      />
      <!-- :estilo="capa.estilo" -->
      <!-- @al-iniciar-carga="() => console.log('C: alIniciarCarga')" -->
      <!-- @al-finalizar-carga="(v) => console.log('C: alFinalizarCarga', v)" -->

      <SisdaiCapaVectorial
        :estilo="estilo_marcador"
        :fuente="capa_marcadores"
        :globoInformativo="(marcador) => marcador.title"
        :posicion="capas.length + 2"
        :id="id_marcadores"
      />
    </SisdaiMapa>
  </ClientOnly>
</template>
