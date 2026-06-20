<script setup>
definePageMeta({
  layout: 'visualizar',
  auth: false,
});

const route = useRoute();
const mapasStore = useMapasStore();

const mapaId = computed(() => Number(route.params.id));

onMounted(async () => {
  await mapasStore.cargarMapa(mapaId.value);
});

onUnmounted(() => {
  mapasStore.limpiarMapa();
});
</script>

<template>
  <div class="visualizar-pagina">
    <div v-if="mapasStore.isLoadingMap" class="estado-carga">
      <div class="spinner" aria-hidden="true"></div>
      <p>Cargando mapa…</p>
    </div>

    <div v-else-if="!mapasStore.activeMap" class="estado-vacio">
      <i class="fa-solid fa-map-location-dot icono" aria-hidden="true"></i>
      <h2 class="m-0">Mapa no disponible</h2>
      <p class="texto-secundario">El mapa no existe o está marcado como privado.</p>
    </div>

    <div v-else :key="mapasStore.activeMap.map_type" class="contenedor-mapa">
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
  </div>
</template>

<style lang="scss" scoped>
.visualizar-pagina {
  width: 100%;
  height: 100%;
}

.contenedor-mapa {
  width: 100%;
  height: 100%;
}

.contenedor-mapa :deep(.visor-mapa) {
  --altura-visor: 100vh !important;
  height: 100vh !important;
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
