<script setup>
const resourceType = "dataLayer";

const config = useRuntimeConfig();
const storeSelected = useSelectedResourcesStore();
const randomNum = ref(1);
const mapa = ref();
function exportarMapa() {
  mapa.value?.exportarImagen("sigic");
}
// Esto de aquí permite cambiar la llave de
watch(
  () => storeSelected.selectedResources[resourceType],
  () => {
    randomNum.value += Math.random();
  },
  { deep: true }
);
</script>

<template>
  <ConsultaLayoutPaneles>
    <template #catalogo>
      <ConsultaLayoutCatalogo
        titulo="Capas geográficas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
      />
    </template>

    <template #visualizador>
      <ClientOnly>
        <SisdaiMapas
          ref="mapa"
          class="gema"
          :vista="{ extension: '-118.3651,14.5321,-86.7104,32.7187' }"
        >
          <SisdaiCapaXyz />

          <SisdaiCapaWms
            v-for="(capa, index) in storeSelected.selectedResources[
              resourceType
            ]"
            :key="`${capa.uuid}_${randomNum}`"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :capa="capa.alternate"
            :posicion="storeSelected.selectedResources.length - index"
          />
        </SisdaiMapas>
      </ClientOnly>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Capas seleccionadas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
        :funcion-descarga="exportarMapa"
      />
    </template>
  </ConsultaLayoutPaneles>
</template>
