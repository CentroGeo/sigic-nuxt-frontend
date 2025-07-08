<script setup>
import ImageTile from "ol/source/ImageTile";
import TileLayer from "ol/layer/Tile";
import _props from "@centrogeomx/sisdai-mapas/src/componentes/capa/xyz/props";
import { MAPA_INYECTADO } from "@centrogeomx/sisdai-mapas/src/utiles/identificadores";

const mapa = inject(MAPA_INYECTADO);
const props = defineProps(_props);
const { titulo, fuente } = toRefs(props);

const source = new ImageTile({
  url: fuente.value,
  crossOrigin: "anonymous",
});

const layer = new TileLayer({ id: props.id, source, titulo: titulo.value });
mapa.addLayer(layer);
</script>

<template>
  <span :sisdai-capa-xyz="props.id" />
</template>
