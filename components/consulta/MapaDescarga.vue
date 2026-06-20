<script setup>
import { SisdaiLeyendaWms } from '@centrogeomx/sisdai-mapas';

const props = defineProps({
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

const { owsLayers } = toRefs(props);

const leyendasCargadas = ref([]);
watch(owsLayers, (nv) => {
  leyendasCargadas.value = nv.map(() => false);
});

function CargaCompleta(idx, v) {
  leyendasCargadas.value[idx] = v;
  console.log(
    toRaw(leyendasCargadas.value),
    leyendasCargadas.value.some((v) => !v),
    !leyendasCargadas.value.every((v) => v)
  );
}
</script>

<template>
  <div class="mapa-descarga flex p-3">
    <div class="columna-11">
      <img :src="mapaImagen" alt="Captura del mapa" />
    </div>

    <div class="columna-5">
      <h1 class="h1 m-t-0">{{ tituloDescarga }}</h1>

      <h2 class="h2">Leyendas</h2>

      <div v-if="leyendasCargadas.some((v) => !v)">
        <img src="/img/loader.gif" alt="Cargando leyendas" />

        <p>Cargando leyendas</p>
      </div>

      <SisdaiLeyendaWms
        v-for="(resource, idx) in owsLayers"
        :key="`capa-wms-${resource.pk}-${resource.position_}`"
        :class="{ 'no-visible': !leyendasCargadas.every((v) => v) }"
        :consulta="funcionConsulta"
        :fuente="resource.fuente"
        :nombre="resource.alternate"
        :sin-control="true"
        :sin-control-clases="true"
        :titulo="resource.title"
        :estilo="resource.estilo"
        @al-finalizar-carga-simbologia="(v) => CargaCompleta(idx, v)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mapa-descarga {
  background-color: #fff;
  color: #000;
}
</style>

<style>
.mapa-descarga .sisdai-mapa-leyenda .lectura {
  color: #000;
}

.mapa-descarga
  .sisdai-mapa
  .contenedor-vis-paneles
  .contenido-vis
  .sisdai-mapa-control.contenedor-controles-vista.ol-unselectable {
  visibility: hidden;
}
</style>
