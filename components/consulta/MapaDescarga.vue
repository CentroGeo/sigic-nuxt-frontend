<script setup>
import {
  // SisdaiCapaArcgis,
  // SisdaiCapaWms,
  // SisdaiCapaXyz,
  // SisdaiLeyendaArcgis,
  SisdaiLeyendaWms,
} from '@centrogeomx/sisdai-mapas';

defineProps({
  funcionConsulta: {
    type: Function,
    required: true,
  },
  owsLayers: {
    type: Array,
    required: true,
  },
  mapaImagen: {
    type: String,
    required: true,
  },
  tituloDescarga: {
    type: String,
    default: '',
  },
});
</script>

<template>
  <div class="mapa-descarga flex p-3">
    <div class="columna-11">
      <img :src="mapaImagen" alt="Captura del mapa" />
    </div>

    <div class="columna-5">
      <h1 class="h1 m-t-0">{{ tituloDescarga }}</h1>

      <h2 class="h2">Leyendas</h2>

      <SisdaiLeyendaWms
        v-for="resource in owsLayers"
        :key="`capa-wms-${resource.pk}-${resource.position_}`"
        :consulta="funcionConsulta"
        :fuente="resource.fuente"
        :nombre="resource.alternate"
        :sin-control="true"
        :sin-control-clases="true"
        :titulo="resource.title"
        :estilo="resource.estilo"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<style>
.mapa-descarga
  .sisdai-mapa
  .contenedor-vis-paneles
  .contenido-vis
  .sisdai-mapa-control.contenedor-controles-vista.ol-unselectable {
  visibility: hidden;
}
</style>
