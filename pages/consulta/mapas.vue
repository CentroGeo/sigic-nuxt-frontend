<script setup>
const mapasStore = useMapasStore();

function deseleccionar() {
  mapasStore.limpiarMapa();
}

onUnmounted(() => {
  mapasStore.limpiarMapa();
});
</script>

<template>
  <ConsultaLayoutPaneles :mostrar-seleccion="false">
    <template #catalogo>
      <ConsultaLayoutCatalogo titulo="Mapas" etiqueta-elementos="Mapas" />
    </template>

    <template #visualizador>
      <div v-if="!mapasStore.activeMap" class="contenedor">
        <ConsultaTarjetaSinSeleccion />
      </div>
      <div v-else :key="mapasStore.activeMap.map_type" class="contenedor-visor">
        <header class="visor-encabezado flex flex-contenido-separado p-x-2 p-y-1">
          <div>
            <strong>Pre-visualizando: {{ mapasStore.activeMap.name }}</strong>
            <span class="texto-secundario"> · {{ mapasStore.activeMap.map_type }}</span>
          </div>
          <div class="flex">
            <NuxtLink
              :to="`/geocontenidos/mapas/${mapasStore.activeMap.id}/visualizar`"
              class="boton-secundario boton-chico"
              target="_blank"
            >
              <i class="fa-solid fa-eye" aria-hidden="true"></i> Visualizar
            </NuxtLink>
            <button class="boton-secundario boton-chico" type="button" @click="deseleccionar">
              Cerrar
            </button>
          </div>
        </header>

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
    </template>
  </ConsultaLayoutPaneles>
</template>

<style lang="scss" scoped>
.contenedor-visor {
  display: flex;
  flex-direction: column;
  height: var(--altura-consulta-esc);
}

.visor-encabezado {
  align-items: center;
  border-bottom: 1px solid var(--color-neutro-1);
}

.contenedor-visor :deep(.visor-mapa) {
  --altura-visor: calc(var(--altura-consulta-esc) - 48px) !important;
  flex: 1;
  height: calc(var(--altura-consulta-esc) - 48px) !important;
}

.flex {
  gap: 8px;
}
</style>
