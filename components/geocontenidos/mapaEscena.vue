<script setup>
import {
  SisdaiCapaVectorial,
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';

const config = useRuntimeConfig();
// const { gnoxyUrl } = useGnoxyUrl();

defineProps({
  capas: { type: Array, default: () => [] },
  vista: { type: Object, default: () => ({}) },
  marcadores: { type: Array, default: () => [] },
});

defineEmits(['clickVista']);

const icono = 16;
</script>

<template>
  <ClientOnly>
    <SisdaiMapa class="gema" :vista="vista" @click-vista="(e) => $emit('clickVista', e)">
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
        :fuente="{
          type: 'FeatureCollection',
          features: marcadores.map((m) => ({
            type: 'Feature',
            properties: {
              id: m.id,
              title: m.title,
              content: m.content,
              icon: m.icon,
              color: m.color,
            },
            geometry: {
              type: 'Point',
              coordinates: [Number(m.lng), Number(m.lat)],
            },
          })),
        }"
        :posicion="capas.length + 1"
        :estilo="[
          {
            // triangulo
            'forma-angulo': Math.PI / 1,
            'forma-desplazamiento': [0, icono],
            'forma-relleno-color': ['get', 'color'],
            'forma-puntos': 3,
            'forma-radio': icono,
          },
          {
            // circulo
            'circulo-desplazamiento': [0, icono * 2],
            'circulo-relleno-color': ['get', 'color'],
            'circulo-radio': icono,
          },
          {
            // pictograma
            'circulo-desplazamiento': [0, icono * 2],
            'circulo-relleno-color': 'white',
            'circulo-radio': icono - icono / 4,
            'texto-relleno-color': ['get', 'color'],
            'texto-tipografia': `${icono + icono / 4}px sisdai-pictogramas`,
            'texto-desplazar_en-y': -(icono * 2) + 1,
            'texto-valor': ['get', 'icon'],
          },
        ]"
      />
    </SisdaiMapa>
  </ClientOnly>
</template>
