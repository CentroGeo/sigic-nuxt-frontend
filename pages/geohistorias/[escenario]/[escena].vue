<script setup>
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { /* escenario, */ escena: escenaId } = useRoute().params;

defineProps({
  titulo: { type: String, default: '' },
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

const marcador_visible = ref(null);
</script>

<template>
  <div class="escena flex flex-contenido-centrado">
    <GeocontenidosLoader v-if="escena.cargando" />

    <template v-else>
      <GeocontenidosEscenaTexto
        v-if="escena.datos.text_position === 'left'"
        class="panel-texto p-3 borde-r borde-color-secundario"
        :contenido="escena.datos.text_content"
        :marcador="marcador_visible"
        @al-cerrar="marcador_visible = null"
      />

      <div class="panel-mapa">
        <GeocontenidosEscenaMapa
          :vista="{
            acercamiento: escena.datos.zoom,
            centro: [escena.datos.map_center_long, escena.datos.map_center_lat],
          }"
          :capas="escena.datos.layers"
          :marcadores="escena.datos.markers"
          @clickMarcador="(marcador) => (marcador_visible = marcador)"
        />
      </div>

      <GeocontenidosEscenaTexto
        v-if="escena.datos.text_position === 'right'"
        class="panel-texto p-3 borde-l borde-color-secundario"
        :contenido="escena.datos.text_content"
        :marcador="marcador_visible"
        @al-cerrar="marcador_visible = null"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.escena {
  width: 100%;
  height: calc(100vh - 80px - 51px);
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
