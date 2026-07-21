<script setup>
import {
  // SisdaiCapaArcgis,
  // SisdaiLeyendaArcgis,
  SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiLeyendaWms,
  // utiles,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';
import SelectedLayer from '~/utils/consulta/SelectedLayer';

definePageMeta({ layout: 'iframe' });

// http://localhost:3000/mapa?capas=8,trayectoria_cat_otis,,1,1;4,amenazas_meteorologicas_otis,,1,1#vista=7/14.3780/-98.6803/false

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { hash, query } = useRoute();

const vistaDelMapa = ref({});
function obtenerVistaDelMapa() {
  const hashString = hash.substring(1); // quita #
  const params = new URLSearchParams(hashString);
  const { vista } = Object.fromEntries(params.entries());

  if (vista) {
    const [acercamiento, latitud, longitud, swipe] = vista.split('/');
    vistaDelMapa.value = { acercamiento, centro: [longitud, latitud] };
  }
}

function obtenerCapas() {
  return query.capas
    .split(';')
    .reverse()
    .map((txt, position) => new SelectedLayer(`${txt},${position}`));
}

const capas_consultadas = ref([]);
async function consultarCapas(capas) {
  const recursos = [];
  for await (const capa of capas) {
    const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/datasets/${capa.pk}`);

    if (!respuesta.ok) return;

    const { dataset } = await respuesta.json();
    recursos.push({
      alternate: dataset.alternate,
      estilo: capa.estilo,
      opacidad: capa.opacidad,
      pk: capa.pk,
      posicion: capa.posicion,
      titulo: dataset.title,
      visible: capa.visible,
    });
  }

  return recursos;
}

onMounted(async () => {
  if (hash) obtenerVistaDelMapa();

  if (query && query.capas) {
    const capas = obtenerCapas();
    capas_consultadas.value = await consultarCapas(capas);
  }
});
</script>

<template>
  <div class="contenedor-ifrme grid">
    <ClientOnly>
      <SisdaiMapa class="mapa gema columna-5-mov columna-11-esc" :vista="vistaDelMapa">
        <SisdaiCapaXyz :posicion="0" id="capa-base" style="display: none" />

        <SisdaiCapaWms
          v-for="capa in capas_consultadas"
          :key="`capa-wms-${capa.pk}-${capa.posicion}-${capa.estilo}`"
          :id="`capa-wms-${capa.pk}-${capa.posicion}-${capa.estilo}`"
          :capa="capa.alternate"
          :consulta="gnoxyFetch"
          :estilo="capa.estilo"
          :fuente="`${config.public.geoserverUrl}/ows`"
          :mosaicos="true"
          :opacidad="capa.opacidad"
          :posicion="capa.posicion + 1"
          :visible="capa.visible"
          style="display: none"
        />
        <!-- 
          :fuente="findServer(resource)"
          :lado="storeSelected.byPk(resource.pk).lado"
          :cuadro-informativo="
            (url) =>
              buildLayerInfo(url, getLayerName(resource), resource.title, resource.sourcetype)
          "
        -->
      </SisdaiMapa>
      <div class="leyendas columna-3-mov columna-5-esc p-3">
        <p class="texto-tamanio-6 m-0">
          <strong>Simbología</strong>
        </p>

        <SisdaiLeyendaWms
          v-for="capa in capas_consultadas"
          class="m-t-2"
          :fuente="`${config.public.geoserverUrl}/wms`"
          :key="`leyenda-wms-${capa.pk}-${capa.posicion}-${capa.estilo}`"
          :nombre="capa.alternate"
          :sin-control-clases="true"
          :titulo="capa.titulo"
          :visible="capa.visible"
          @alCambiarVisibilidad="([v]) => (capa.visible = v)"
        />
      </div>

      <template #fallback>
        <img
          :src="`${config.app.baseURL}img/logo_sigic.svg`"
          class="imagen-muestra color-invertir"
          alt="SIGIC"
        />
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
.contenedor-ifrme {
  /*background-color: blanchedalmond;*/
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 99999;
  gap: 0;

  .sisdai-mapa.gema.mapa .contenedor-vis-paneles {
    /* background-color: cadetblue; */
    grid-template-rows: 0 0 auto 0 0;

    .contenido-vis {
      grid-row: 3 / span 3;
    }
  }

  .leyendas {
    /* background-color: cornflowerblue; */
    overflow: auto;
  }
}
</style>
