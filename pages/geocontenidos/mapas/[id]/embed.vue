<script setup>
definePageMeta({
  layout: 'visualizar',
  auth: false,
});

const route = useRoute();
const mapasStore = useMapasStore();
const config = useRuntimeConfig();

const mapaId = computed(() => Number(route.params.id));

const mostrarControles = computed(() => route.query.controles !== 'false');
const mostrarMarca = computed(() => route.query.marca !== 'false');

const urlOrigen = computed(() =>
  typeof window !== 'undefined' ? window.location.origin : (config.app?.baseURL ?? '/')
);

const enlaceFuente = computed(() =>
  mapasStore.activeMap
    ? `${urlOrigen.value}/geocontenidos/mapas/${mapasStore.activeMap.id}/visualizar`
    : '#'
);

onMounted(async () => {
  await mapasStore.cargarMapa(mapaId.value);
});

onUnmounted(() => {
  mapasStore.limpiarMapa();
});
</script>

<template>
  <div class="embed-pagina" :class="{ 'ocultar-controles': !mostrarControles }">
    <div v-if="mapasStore.isLoadingMap" class="estado-carga">
      <div class="spinner" aria-hidden="true"></div>
      <p>Cargando mapa…</p>
    </div>

    <div v-else-if="!mapasStore.activeMap" class="estado-vacio">
      <i class="fa-solid fa-map-location-dot icono" aria-hidden="true"></i>
      <h2 class="m-0">Mapa no disponible</h2>
      <p class="texto-secundario">El mapa no existe o está marcado como privado.</p>
    </div>

    <template v-else>
      <div :key="mapasStore.activeMap.map_type" class="contenedor-mapa">
        <MapasVisorMapa
          v-if="mapasStore.activeMap.map_type === 'regular'"
          :mapa="mapasStore.activeMap"
          :capas="mapasStore.activeLayers"
        />
        <MapasVisorSwipe
          v-else-if="mapasStore.activeMap.map_type === 'swipe'"
          :mapa="mapasStore.activeMap"
          :capas="mapasStore.activeLayers"
        />
        <MapasVisorDual
          v-else-if="mapasStore.activeMap.map_type === 'dual'"
          :mapa="mapasStore.activeMap"
          :capas="mapasStore.activeLayers"
        />
      </div>

      <a v-if="mostrarMarca" :href="enlaceFuente" target="_blank" rel="noopener" class="marca-agua">
        <i class="fa-solid fa-up-right-from-square" aria-hidden="true"></i>
        {{ mapasStore.activeMap.name }}
      </a>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.embed-pagina {
  width: 100%;
  height: 100%;
  position: relative;
}

.contenedor-mapa {
  width: 100%;
  height: 100%;
}

.contenedor-mapa :deep(.visor-mapa) {
  --altura-visor: 100vh !important;
  height: 100vh !important;
}

.marca-agua {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 0.75rem;
  background-color: rgba(255, 255, 255, 0.85);
  color: #222;
  border-radius: 6px;
  text-decoration: none;
  pointer-events: auto;

  &:hover {
    background-color: rgba(255, 255, 255, 0.95);
  }
}

.ocultar-controles :deep(.visor-coords),
.ocultar-controles :deep(.sisdai-mapa-control),
.ocultar-controles :deep(.ol-scale-line),
.ocultar-controles :deep(.ol-control) {
  display: none !important;
}

.estado-carga,
.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100vh;
  text-align: center;
  padding: 24px;
}

.estado-vacio .icono {
  font-size: 3rem;
  color: var(--color-neutro-1, #ccc);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-neutro-1, #ccc);
  border-top-color: var(--color-primario, #ff51ba);
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}
</style>
