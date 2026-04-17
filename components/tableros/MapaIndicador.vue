<script setup>
import { SisdaiCapaWms, SisdaiCapaXyz, SisdaiMapa } from '@centrogeomx/sisdai-mapas';

const config = useRuntimeConfig();

defineProps({
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
  useFilter: {
    type: Boolean,
    default: false,
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
});

const vista = {
  centro: [-99.1332, 19.4326],
  zoom: 5,
};
</script>

<template>
  <ClientOnly>
    <div class="mapa-indicador">
      <SisdaiMapa class="gema" :vista="vista">
        <SisdaiCapaXyz :posicion="0" />

        <SisdaiCapaWms
          v-if="mapValues?.layer_name"
          :fuente="`${config.public.geoserverUrl}/ows`"
          :capa="mapValues.layer_name"
          :posicion="1"
          :visible="true"
        />
      </SisdaiMapa>

      <div v-if="plotConfig?.ranges" class="mapa-indicador__leyenda">
        <p class="mapa-indicador__leyenda-titulo">{{ plotConfig.title || 'Leyenda' }}</p>
        <ul class="mapa-indicador__leyenda-lista">
          <li
            v-for="(rango, idx) in plotConfig.ranges"
            :key="idx"
            class="mapa-indicador__leyenda-item"
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
  min-height: 400px;

  .gema {
    width: 100%;
    height: 400px;
  }

  &__leyenda {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 6px;
    padding: 0.75rem;
    font-size: 0.8rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    max-width: 200px;
  }

  &__leyenda-titulo {
    margin: 0 0 0.5rem;
    font-weight: 600;
    font-size: 0.8rem;
  }

  &__leyenda-lista {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__leyenda-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.15rem 0;
  }

  &__leyenda-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    flex-shrink: 0;
  }
}
</style>
