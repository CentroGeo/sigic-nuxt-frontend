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
const randomNum = ref(0);

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
watch(
  () => storeSelected.selectedResources[resourceType],
  () => {
    randomNum.value += Math.random();
  },
  { deep: true }
);

// bbox_polygon
// api/v2/datasets?page_size=1&filter{alternate.in}[]=alternate
const cuadroInformativo2 = {
  params: {
    propertyName: "nombre",
  },
  contenido: (d) => `<p><b>nombre</b>: ${d["nombre"]}</p>`,
};
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
            v-for="(capa, index) in storeSelected.selectedResources[
              resourceType
            ]"
            :key="`${capa.uuid}_${randomNum}`"
            :fuente="`${config.public.geoserverUrl}/wms?`"
            :capa="capa.alternate"
            :posicion="storeSelected.selectedResources.length - index"
            :cuadro-informativo="cuadroInformativo2"
          />
        </SisdaiMapa>
      </ClientOnly>
    </template>

    <template #seleccion>
      <ConsultaLayoutSeleccion
        titulo="Capas seleccionadas"
        :resource-type="resourceType"
        etiqueta-elementos="Capas"
        :funcion-descarga="exportarMapa"
      />
      <a ref="linkExportaMapa" class="oculto" download="sigic.png" />
    </template>
  </ConsultaLayoutPaneles>
</template>
