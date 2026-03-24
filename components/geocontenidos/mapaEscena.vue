<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';

const config = useRuntimeConfig();

defineProps({
  capas: { type: Array, default: () => [] },
  vista: { type: Object, default: () => ({}) },
});
</script>

<template>
  <ClientOnly>
    <SisdaiMapa class="gema" :vista="vista">
      <SisdaiCapaXyz :posicion="0" />

      <SisdaiCapaWms
        v-for="capa in capas"
        :key="`capa-${capa.name}-${capa.stack_order}`"
        :fuente="`${config.public.geoserverUrl}/wms`"
        :capa="capa.name"
        :opacidad="capa.opacity"
        :posicion="capa.stack_order"
        :visible="capa.visible"
      />
      <!-- :estilo="capa.estilo" -->
    </SisdaiMapa>
  </ClientOnly>
</template>
