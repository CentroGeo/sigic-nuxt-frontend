<script setup>
definePageMeta({ middleware: 'auth' });

import useApi from '~/composables/geocontenidos/useApi';
import { wait } from '~/utils/consulta';

const { escenario: escenario_id, escena: escena_id } = useRoute().params;
const escena = reactive({
  name: '',
  text_content: '',
  scenario: escenario_id,
  text_position: 'left',
  map_center_lat: null,
  map_center_long: null,
  zoom: null,
  layers: [],
  markers: [],
});
let valores_estaticos = '';

const { api, modal, mostrarModalCargando, mostrarModalError, mostrarModalExito } = useApi();

async function consultarEscena() {
  if (escena_id === 'nuevo') return;

  mostrarModalCargando('Cargando escena...');
  const { respuesta, datos } = await api(`scenes/${escena_id}`);

  if (!respuesta.ok) {
    mostrarModalError([datos.detail]);
    modal.permitirCerrar = false;
    return;
  }

  Object.assign(escena, datos);
  valores_estaticos = JSON.stringify(escena);
  modal.visible = false;
}
consultarEscena();

const datos_validos = computed(
  () => !(valores_estaticos === JSON.stringify(escena) || escena.name === '')
);

async function guardarCambios() {
  if (!datos_validos.value) return;
  mostrarModalCargando();

  const url = `scenes/${escena_id !== 'nuevo' ? `${escena_id}/` : ''}/`;
  const { datos } = await api(url, escena_id === 'nuevo' ? 'POST' : 'PUT', escena);

  if (datos?.success === false) {
    mostrarModalError(datos.errors);
    return;
  }

  mostrarModalExito();
  await wait(1500);

  if (escena_id === 'nuevo') {
    navigateTo(`/geocontenidos/geohistorias/${escenario_id}/escenas/`);

    // const { datos } = await api(`scenarios/${escenario_id}/scenes/`);
    // const ultima_escena = datos.map((i) => i.id).sort()[datos.length - 1];
    // navigateTo(`/geocontenidos/geohistorias/${escenario_id}/escenas/${ultima_escena}/editar`);
  } else {
    reloadNuxtApp();
  }
}

function alMoverVista({ acercamiento, centro }) {
  // console.log(acercamiento, centro);
  escena.map_center_long = centro[0];
  escena.map_center_lat = centro[1];
  escena.zoom = acercamiento;
}
const vistaDelMapa = computed(() => {
  const vista = { acercamiento: escena.zoom || 2 };

  if (escena.map_center_long && escena.map_center_lat) {
    vista.centro = [escena.map_center_long, escena.map_center_lat];
  } else {
    vista.extension = '-118.3651,14.5321,-86.7104,32.7187';
  }

  return vista;
});
</script>

<template>
  <form @submit.prevent="guardarCambios">
    <section>
      <GeocontenidosTituloVolver
        :volver="`geohistorias/${escenario_id}/escenas`"
        titulo="Edición de la escena"
      />

      <div class="m-b-4">
        <label for="nombre">Nombre de la escena</label>
        <input
          id="nombre"
          v-model="escena.name"
          type="text"
          placeholder="Ej: Vista general del área de estudio"
          required
        />
      </div>

      <div class="m-b-4">
        <label>Contenido de la escena</label>
        <UiEditorTexto v-model="escena.text_content" />
      </div>

      <div class="m-b-4">
        <label for="posicion">Posición del texto</label>
        <select id="posicion" v-model="escena.text_position">
          <option value="left">Izquierda</option>
          <option value="right">Derecha</option>
        </select>
      </div>
    </section>

    <section class="m-b-4">
      <h2>Vista previa interactiva</h2>

      <div class="grid">
        <div class="columna-8-mov columna-6-esc">
          <p class="m-t-0">Ajusta el mapa y zoom para ajustar la vista</p>

          <fieldset>
            <label for="lng">Longitud</label>
            <input
              id="lng"
              v-model="escena.map_center_long"
              type="number"
              step="any"
              max="180"
              min="-180"
              required
            />
          </fieldset>

          <fieldset>
            <label for="lat">Latitud</label>
            <input
              id="lat"
              v-model="escena.map_center_lat"
              type="number"
              step="any"
              max="90"
              min="-90"
              required
            />
          </fieldset>

          <fieldset>
            <label for="zoom">Nivel de acercamiento</label>
            <input
              id="zoom"
              v-model="escena.zoom"
              type="number"
              step="any"
              max="90"
              min="-90"
              required
            />
          </fieldset>
        </div>

        <GeocontenidosEscenaMapa
          :vista="vistaDelMapa"
          @al-mover-vista="alMoverVista"
          class="columna-8-mov columna-10-esc"
          :capas="escena.layers"
          :marcadores="escena.markers"
        />
      </div>
    </section>

    <section class="flex flex-contenido-final">
      <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario">Volver</NuxtLink>

      <input type="submit" class="boton-primario" value="Guardar" :disabled="!datos_validos" />
    </section>

    <GeocontenidosLoaderModal v-bind="modal" @al-cerrar="modal.visible = false" />
  </form>
</template>
