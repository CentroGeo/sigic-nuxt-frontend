<script setup>
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { /* escenario, */ escena: escenaId } = useRoute().params;

defineProps({
  titulo: { type: String, default: () => '' },
});

/**
 *
 */
const escena = reactive({
  cargando: false,
  datos: {},
});

/**
 * Realiza la consulta de la escena
 */
async function consultarEscena() {
  escena.cargando = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenes/${escenaId}`);

  const datos = await respuesta.json();
  Object.assign(escena.datos, datos);

  escena.cargando = false;
}
consultarEscena();
</script>

<template>
  <div class="escena flex flex-contenido-centrado">
    <GeocontenidosLoader v-if="escena.cargando" />

    <template v-else>
      <div
        v-if="escena.datos.text_position === 'right'"
        class="panel-mapa borde-r borde-color-secundario"
      >
        <GeocontenidosMapaEscena
          :vista="{
            acercamiento: escena.datos.zoom,
            centro: [escena.datos.map_center_long, escena.datos.map_center_lat],
          }"
          :capas="escena.datos.layers"
        />
      </div>

      <div class="panel-texto p-4">
        <h1 class="m-t-0 m-b-8">{{ titulo }}</h1>

        <h2 class="m-t-2">{{ escena.datos.name }}</h2>

        <!-- eslint-disable vue/no-v-html -->
        <p v-html="escena.datos.text_content" />

        <!-- <p>
          {{ escena.datos }}
        </p> -->

        <!-- <div>Paginador</div> -->
      </div>

      <div
        v-if="escena.datos.text_position === 'left'"
        class="panel-mapa borde-l borde-color-secundario"
      >
        <GeocontenidosMapaEscena
          :vista="{
            acercamiento: escena.datos.zoom,
            centro: [escena.datos.map_center_long, escena.datos.map_center_lat],
          }"
          :capas="escena.datos.layers"
        />
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.escena {
  width: 100%;
  height: calc(100vh - 100px - 51px);
  gap: 0;

  .panel-texto {
    height: inherit;
    width: var(--ancho-panel-texto);
    overflow-y: auto;
  }

  .panel-mapa {
    width: calc(100% - var(--ancho-panel-texto));
  }
}
</style>
