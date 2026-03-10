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

const escenario = ref(null);
const estaCargando = ref(false);

async function cargarEscenario() {
  estaCargando.value = true;
  const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenarios/${slug}`);

  const data = await respuesta.json();
  escenario.value = data;
  // console.log(data);

  // estaCargando.value = false;
}
cargarEscenario();
</script>

<template>
  <div class="vista-geohistorias escenario">
    <div
      v-if="escenario?.scenes_layout_styles.timeline_position === 'top'"
      class="linea-tiempo"
      :style="{
        background: `linear-gradient(to right, ${escenario?.scenes_layout_styles.gradient_start}, ${escenario?.scenes_layout_styles.gradient_end})`,
      }"
    >
      <!-- Gradiente -->
    </div>

    <div class="escena flex">
      <div
        class="borde-r borde-color-secundario"
        :style="`width: ${escenario?.scenes_layout_styles.text_panel}%;`"
      >
        <p v-for="_ in [, , , ,]" :key="_">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Laboriosam ducimus facilis
          aspernatur, iure at quia labore hic illum quisquam, voluptatibus voluptas consequuntur
          cupiditate velit fuga accusantium aliquid ex perferendis tempore.
        </p>

        <div>Paginador</div>
      </div>

      <div
        class="borde-l borde-color-secundario"
        :style="`width: ${escenario?.scenes_layout_styles.map_panel}%;`"
      >
        <!-- Mapa {{ escenario?.scenes_layout_styles.map_panel }}% -->
        <ClientOnly>
          <SisdaiMapa class="gema" :vista="{ extension: '-118.3651,14.5321,-86.7104,32.7187' }">
            <SisdaiCapaXyz :posicion="0" />
          </SisdaiMapa>
        </ClientOnly>
      </div>
    </div>

    <div
      v-if="escenario?.scenes_layout_styles.timeline_position === 'bottom'"
      class="linea-tiempo"
      :style="{
        background: `linear-gradient(to right, ${escenario?.scenes_layout_styles.gradient_start}, ${escenario?.scenes_layout_styles.gradient_end})`,
      }"
    >
      <!-- Gradiente -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vista-geohistorias.escenario {
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
