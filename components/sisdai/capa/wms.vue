<script setup>
import ImageWMS from "ol/source/ImageWMS.js";
import { Image as ImageLayer } from "ol/layer.js";
import _props from "@centrogeomx/sisdai-mapas/src/componentes/capa/wms/props";
import { MAPA_INYECTADO } from "@centrogeomx/sisdai-mapas/src/utiles/identificadores";

const mapa = inject(MAPA_INYECTADO);
const props = defineProps(_props);
const { estilo, filtro, titulo } = toRefs(props);

const source = new ImageWMS({
  params: {
    LAYERS: props.capa,
    STYLES: estilo.value,
    CQL_FILTER: filtro.value,
  },
  ratio: 1,
  serverType: props.tipoServidor,
  url: props.fuente,
});

const capa = new ImageLayer({
  id: props.id,
  source,
  tipo: "wms",
  titulo: titulo.value,
});

onMounted(() => {
  mapa.addLayer(capa);
});

onUnmounted(() => {
  mapa.removeLayer(
    mapa.getAllLayers().find((layer) => layer.get("id") === props.id)
  );
});
</script>

<template>
  <span :sisdai-capa-wms="props.id" />
</template>
