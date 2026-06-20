<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  capas: {
    type: Array,
    default: () => [],
  },
  geoserverUrl: {
    type: String,
    required: true,
  },
});

const { gnoxyUrl } = useGnoxyUrl();

const abierto = ref(false);

// Capas con nombre, ordenadas de arriba hacia abajo (igual que se dibujan).
const capasConLeyenda = computed(() =>
  [...props.capas].filter((c) => c.name).sort((a, b) => b.stack_order - a.stack_order)
);

function leyendaUrl(capa) {
  const params = new URLSearchParams({
    REQUEST: 'GetLegendGraphic',
    VERSION: '1.0.0',
    FORMAT: 'image/png',
    LAYER: capa.name,
    LEGEND_OPTIONS: 'forceLabels:on;fontAntiAliasing:true',
  });
  if (capa.style) params.set('STYLE', capa.style);
  return gnoxyUrl(`${props.geoserverUrl}/wms?${params.toString()}`);
}

function alternar() {
  abierto.value = !abierto.value;
}
</script>

<template>
  <div class="leyenda-control">
    <div v-if="abierto" class="leyenda-panel">
      <div class="leyenda-encabezado flex flex-contenido-separado">
        <strong>Leyenda</strong>
        <button class="leyenda-cerrar" type="button" aria-label="Cerrar leyenda" @click="alternar">
          <span class="pictograma-tache" aria-hidden="true" />
        </button>
      </div>
      <p v-if="!capasConLeyenda.length" class="leyenda-vacia">Este mapa no tiene capas.</p>
      <ul v-else class="leyenda-lista">
        <li v-for="capa in capasConLeyenda" :key="capa.id" class="leyenda-item">
          <span class="leyenda-titulo">{{ capa.dataset_title || capa.name }}</span>
          <img
            :src="leyendaUrl(capa)"
            :alt="`Leyenda de ${capa.dataset_title || capa.name}`"
            loading="lazy"
          />
        </li>
      </ul>
    </div>

    <button
      class="leyenda-boton sisdai-mapa-control-boton"
      type="button"
      :aria-pressed="abierto"
      aria-label="Mostrar leyenda"
      title="Leyenda"
      @click="alternar"
    >
      <i class="fa-solid fa-list" aria-hidden="true"></i>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.leyenda-control {
  position: absolute;
  bottom: 42px;
  left: 8px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.leyenda-boton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  background-color: var(--boton-mapa-fondo, #ff51ba);
  color: var(--boton-mapa-texto, #fff);

  &:hover,
  &:focus-visible {
    background-color: var(--boton-mapa-fondo-hover, #ff51ba);
    filter: brightness(0.92);
  }
}

.leyenda-panel {
  width: 240px;
  max-height: calc(var(--altura-visor, 60vh) - 80px);
  overflow-y: auto;
  background-color: rgba(255, 255, 255, 0.96);
  color: #222;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  padding: 8px 10px;
}

.leyenda-encabezado {
  align-items: center;
  margin-bottom: 6px;
}

.leyenda-cerrar {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 2px;
  line-height: 1;
  color: #555;
}

.leyenda-vacia {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

.leyenda-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leyenda-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.leyenda-titulo {
  font-size: 0.8rem;
  font-weight: 600;
  word-break: break-word;
}

.leyenda-item img {
  max-width: 100%;
  height: auto;
}

.flex {
  display: flex;
  gap: 8px;
}

.flex-contenido-separado {
  justify-content: space-between;
}
</style>
