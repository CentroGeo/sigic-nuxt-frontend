<script setup>
import {
  // SisdaiCapaWms,
  SisdaiCapaXyz,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';

const slug = useRoute().params.slug;

// uasar layout de geohistorias para mostrar el escenario
definePageMeta({
  layout: 'geohistorias',
});

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();

const escenario = reactive({});
const escena = reactive({});
const estaCargando = ref(false);

async function cargarEscenario() {
  estaCargando.value = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenarios/${slug}`);

  const data = await respuesta.json();
  Object.assign(escenario, data);
  console.log('escenario', data);

  cargarEscena(data.scenes[0].id);
}
cargarEscenario();

async function cargarEscena(escenaId) {
  // console.log('cargar', escenaId);
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenes/${escenaId}`);

  const data = await respuesta.json();
  Object.assign(escena, data);
  console.log('escena', data);

  estaCargando.value = false;
}
</script>

<template>
  <div class="vista-geohistorias escenario">
    <GeocontenidosLoader v-if="estaCargando" />

    <template v-else>
      <GeocontenidosTab
        v-if="escenario?.scenes_layout_styles.timeline_position === 'top'"
        :layout-styles="escenario.scenes_layout_styles"
        :tabs="escenario.scenes"
        @al-click-tab="cargarEscena"
      />

      <div class="escena flex">
        <div
          v-if="escena.text_position === 'left'"
          class="borde-r borde-color-secundario"
          :style="`width: ${escenario?.scenes_layout_styles.text_panel}%;`"
        >
          <h1>{{ escena.name }}</h1>
          <div v-html="escena.text_content" />
          <!-- <div>Paginador</div> -->
        </div>

        <div :style="`width: ${escenario?.scenes_layout_styles.map_panel}%;`">
          <ClientOnly>
            <SisdaiMapa
              class="gema"
              :vista="{
                acercamiento: escena.zoom,
                centro: [escena.map_center_long, escena.map_center_lat],
              }"
            >
              <SisdaiCapaXyz :posicion="0" />
            </SisdaiMapa>
          </ClientOnly>
        </div>

        <div
          v-if="escena.text_position === 'right'"
          class="borde-l borde-color-secundario"
          :style="`width: ${escenario?.scenes_layout_styles.text_panel}%;`"
        >
          <h1>{{ escena.name }}</h1>
          <div v-html="escena.text_content" />
          <!-- <div>Paginador</div> -->
        </div>
      </div>

      <GeocontenidosTab
        v-if="escenario?.scenes_layout_styles.timeline_position === 'bottom'"
        :layout-styles="escenario.scenes_layout_styles"
        :tabs="escenario.scenes"
        @al-click-tab="cargarEscena"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.vista-geohistorias.escenario {
  min-height: 100vh;
  align-content: center;

  .linea-tiempo {
    width: 100%;
    height: 100px;
  }

  .escena {
    width: 100%;
    min-height: calc(100vh - 100px);
    gap: 0;
  }
}
</style>
