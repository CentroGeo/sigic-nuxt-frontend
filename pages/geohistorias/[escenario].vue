<script setup>
definePageMeta({ layout: 'geohistorias' });

const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { escenario: idEscenario, escena } = useRoute().params;

/**
 *
 */
const escenario = reactive({
  cargando: false,
  datos: {},
});

/**
 * Realiza la consulta del escenario
 */
async function consutarEscenario() {
  escenario.cargando = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenarios/${idEscenario}`);

  const data = await respuesta.json();
  Object.assign(escenario.datos, data);

  await validarEscena(data.scenes);
  escenario.cargando = false;
}
consutarEscenario();

/**
 * Valida si la escena existe o es parte del escenario, si no lo es se redirige a una escena válida
 * @param {Array<scenes>} Escenas del escenario
 */
async function validarEscena(scenes) {
  if (escena === undefined || !scenes.map(({ id }) => String(id)).includes(escena)) {
    await redirigir(scenes[0].id);
  }
}

/**
 * Redirige la navegación a una escena
 * @param {Number|String} Identificador de la escena
 */
async function redirigir(escenaId) {
  await navigateTo(`${config.public.basePath}/geohistorias/${idEscenario}/${escenaId}`);
}
</script>

<template>
  <main class="escenario">
    <GeocontenidosLoader v-if="escenario.cargando" />

    <template v-else>
      <GeocontenidosTab
        v-if="escenario.datos.scenes_layout_styles.timeline_position === 'top'"
        :tabs="escenario.datos.scenes"
        :layout-styles="escenario.datos.scenes_layout_styles"
        @al-click-tab="redirigir"
      />

      <NuxtPage
        :style="`--ancho-panel-texto: ${escenario.datos.scenes_layout_styles.text_panel}%`"
      />

      <GeocontenidosTab
        v-if="escenario.datos.scenes_layout_styles.timeline_position === 'bottom'"
        :layout-styles="escenario.datos.scenes_layout_styles"
        :tabs="escenario.datos.scenes"
        @al-click-tab="redirigir"
      />
    </template>
  </main>
</template>
