<script setup>
import {
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiMapa,
} from "@centrogeomx/sisdai-mapas";
import html2canvas from "html2canvas";

const resourceType = "dataLayer";

const config = useRuntimeConfig();
const storeSelected = useSelectedResourcesStore();

const linkExportaMapa = ref();

function exportarMapa() {
  const html = document.querySelectorAll(".mapa .ol-viewport").item(0);
  html2canvas(html, {
    useCORS: true,
  }).then((canvas) => {
    linkExportaMapa.value.href = canvas.toDataURL();
    linkExportaMapa.value.click();
  });
}
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
        <SisdaiMapa
          class="gema"
          :vista="{ extension: '-118.3651,14.5321,-86.7104,32.7187' }"
        >
          <SisdaiCapaXyz />

          <SisdaiCapaWms
            v-for="capa in storeSelected.selectedResources[resourceType]"
            :key="capa.uuid"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :capa="capa.alternate"
          />
        </SisdaiMapa>
      </ClientOnly>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Capas seleccionadas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
      />
      <a ref="linkExportaMapa" class="oculto" download="sigic.png" />
    </template>
  </ConsultaLayoutPaneles>
</template>
