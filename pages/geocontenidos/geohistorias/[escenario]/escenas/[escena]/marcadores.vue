<script setup>
import pictogramas from '~/utils/geocontenidos/pictogramas.json';

const { escenario, escena: escenaId } = useRoute().params;
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();

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

const nuevaMarca = reactive({
  scene: escenaId,
  lat: undefined,
  lng: undefined,
  title: '',
  content: '',
  icon: String.fromCharCode(parseInt(pictogramas['agregar'], 16)),
  // icon: 'fas fa-landmark',
  // color: '#2563eb',
  color: 'pink',
});

const marcadores = ref([
  // {
  //   id: 1,
  //   scene: 1,
  //   // lat: '19.4326000000',
  //   // lng: '-99.1332000000',
  //   lat: 19.734229412412127,
  //   lng: -101.25802689601808,
  //   title: 'Zócalo CDMX',
  //   content: '<p>Centro histórico</p>',
  //   icon: 'fas fa-landmark',
  //   color: '#2563eb',
  //   image_url: null,
  //   options: {},
  // },
]);

function clickVista({ coordenadas }) {
  nuevaMarca.lat = coordenadas[1];
  nuevaMarca.lng = coordenadas[0];
}

/**
 * Función ejecutada al dar submit en el formulario de la vista
 */
function guardarCambios() {
  console.table(toRaw(nuevaMarca));
  marcadores.value.push({ ...nuevaMarca, id: marcadores.value.length });
}
</script>

<template>
  <form class="gestion-marcadores" @submit.prevent="guardarCambios">
    <section>
      <GeocontenidosTituloVolver
        :volver="`/geohistorias/${escenario}/escenas`"
        titulo="Agregar/Editar marcadores"
      />

      <p class="m-0">Agrega puntos de interés en el mapa de esta escena.</p>
      <!-- {{ escena.datos.layers }} -->
      <!-- {{ escena.datos }} -->

      <pre>{{ marcadores }}</pre>
      <!-- {{ pictogramas }} -->
    </section>

    <GeocontenidosLoader v-if="escena.cargando" />

    <section v-else class="flex">
      <div class="columna-8">
        <h3>Mapa interactivo</h3>

        <p>Haz click en el mapa para seleccionar la ubicación del marcador.</p>

        <GeocontenidosMapaEscena
          class="borde borde-color-secundario"
          :vista="{
            acercamiento: escena.datos.zoom,
            centro: [escena.datos.map_center_long, escena.datos.map_center_lat],
          }"
          :capas="escena.datos.layers"
          :marcadores="[...marcadores, nuevaMarca]"
          @click-vista="clickVista"
        />
      </div>

      <div class="columna-8">
        <h3>Marcadores</h3>

        <GeocontenidosPestanias
          :pestanias="[
            { id: 'nuevo', titulo: `+ ${nuevaMarca.title}` },
            ...marcadores.map((m) => ({ id: m.id, titulo: m.title })),
          ]"
        >
          <template #contenido-nuevo>
            <fieldset>
              <label for="titulo">Titulo</label>
              <input id="titulo" v-model="nuevaMarca.title" type="text" required />
            </fieldset>

            <fieldset>
              <label>Descripción</label>
              <GeocontenidosEditor v-model="nuevaMarca.content" />
            </fieldset>

            <fieldset>
              <label for="icono">Icono</label>
              <select id="icono" v-model="nuevaMarca.icon" required>
                <option
                  v-for="pictograma in Object.keys(pictogramas).sort()"
                  :key="pictograma"
                  :value="String.fromCharCode(parseInt(pictogramas[pictograma], 16))"
                >
                  {{ pictograma.split('-').join(' ') }}
                </option>
              </select>
            </fieldset>

            <fieldset>
              <label for="color">Color del marcador</label>
              <input id="color" v-model="nuevaMarca.color" type="color" required />
            </fieldset>
          </template>
        </GeocontenidosPestanias>
      </div>
    </section>

    <section class="flex flex-contenido-final">
      <NuxtLink
        :to="`/geocontenidos/geohistorias/${escenario}/escenas`"
        class="boton boton-secundario"
      >
        Volver
      </NuxtLink>

      <button class="boton-secundario" disabled>Restablecer</button>

      <input type="submit" class="boton-primario" value="Guardar" />
    </section>
  </form>
</template>

<style lang="scss">
.gestion-marcadores {
  .sisdai-mapa.gema {
    height: inherit;
  }
}
</style>
