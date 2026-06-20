<script setup>
const route = useRoute();
const mapasStore = useMapasStore();

const idActual = computed(() => route.params.id ?? null);
const enDetalleMapa = computed(() => !!idActual.value);
const enVisualizar = computed(() => route.path.endsWith('/visualizar'));
const enEmbed = computed(() => route.path.endsWith('/embed'));
const enChromeOculto = computed(() => enVisualizar.value || enEmbed.value);
</script>

<template>
  <NuxtPage v-if="enChromeOculto" />
  <div v-else class="modulo-mapas-geocontenidos">
    <NuxtPage />
    <MapasModalAgregarCapas
      v-if="enDetalleMapa && mapasStore.activeMap"
      :mapa-id="Number(idActual)"
      :map-type="mapasStore.activeMap.map_type"
    />
  </div>
</template>

<style lang="scss" scoped>
.modulo-mapas-geocontenidos {
  height: 100%;
  overflow-y: hidden;
}
</style>
