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
</script>

<template>
  <ClientOnly>
    <SisdaiMapa class="gema" :vista="vista" @click-vista="(e) => $emit('clickVista', e)">
      <SisdaiCapaXyz :posicion="0" />

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
        :estilo="{
          'icono-anchura': 32,
          'icono-altura': 32,
          'icono-fuente': `${config.public.baseURL}${config.public.basePath}/img/localizacion.svg`,
        }"
      />
      <!-- 
        :fuente="{
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { id: 0, img: 'url' },
              geometry: {
                type: 'Point',
                // coordinates: [-100.87976758760212, 20.754629042101435],
                coordinates: [-101.25802689601808, 19.734229412412127],
              },
            },
          ],
        }"
         -->
    </SisdaiMapa>
  </ClientOnly>
</template>
