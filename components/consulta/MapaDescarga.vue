<script setup>
import {
  // SisdaiCapaArcgis,
  SisdaiCapaWms,
  SisdaiCapaXyz,
  // SisdaiLeyendaArcgis,
  SisdaiLeyendaWms,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';

const props = defineProps({
  vistaDelMapa: {
    type: Object,
    required: true,
  },
  funcionConsulta: {
    type: Function,
    required: true,
  },
  owsLayers: {
    type: Array,
    required: true,
  },
});

console.log(toRaw(props.vistaDelMapa));
</script>

<template>
  <div class="mapa-descarga flex p-3">
    <SisdaiMapa class="gema columna-10" :vista="vistaDelMapa">
      <SisdaiCapaXyz :posicion="0" />

      <SisdaiCapaWms
        v-for="resource in owsLayers"
        :key="`capa-wms-${resource.pk}-${resource.position_}`"
        :capa="resource.alternate"
        :consulta="funcionConsulta"
        :fuente="resource.fuente"
        :mosaicos="true"
      />
      <!-- 
        :lado="storeSelected.byPk(resource.pk).lado"
        :opacidad="storeSelected.byPk(resource.pk).opacidad"
        :posicion="storeSelected.byPk(resource.pk).posicion + 1"
        :visible="storeSelected.byPk(resource.pk).visible"
        :estilo="storeSelected.byPk(resource.pk).estilo"
       -->
    </SisdaiMapa>

    <div class="columna-6">
      <h1 class="h1 m-t-0" :contenteditable="true">Click aquí para cambiar el título</h1>

      <h2 class="h2">Lesyendas</h2>

      <SisdaiLeyendaWms
        v-for="resource in owsLayers"
        :key="`capa-wms-${resource.pk}-${resource.position_}`"
        :consulta="funcionConsulta"
        :fuente="resource.fuente"
        :nombre="resource.alternate"
        :sin-control="true"
        :sin-control-clases="true"
        :titulo="resource.title"
      />
      <!-- 
        :estilo="storeSelected.byPk(resourceElement.pk).estilo"
       -->
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
