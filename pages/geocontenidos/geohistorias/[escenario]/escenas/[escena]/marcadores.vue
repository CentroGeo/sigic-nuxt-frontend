<script setup>
import { valoresPorDefecto as valoresModal } from '~/components/geocontenidos/loaderModal.vue';
import { wait } from '~/utils/consulta';
import { GestionMarcadores } from '~/utils/geocontenidos/GestionMarcadores';
import pictogramas from '~/utils/geocontenidos/pictogramas.json';

const { escenario, escena: escenaId } = useRoute().params;
const { gnoxyFetch } = useGnoxyUrl();
const config = useRuntimeConfig();
const { geonodeApi } = config.public;

/**
 * Guarda los datos de la escena y su estado de carga
 */
const escena = reactive({
  cargando: false,
  datos: {},
  idMarcadorActivo: null,
});
const gMarcadores = reactive(new GestionMarcadores());

async function API(endPoint, method = 'GET', body = {}) {
  // urlBase = `${geonodeApi}/scene-markers`
  const parametros = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (method !== 'GET') {
    parametros.body = JSON.stringify(body);
  }

  const respuesta = await gnoxyFetch(`${geonodeApi}/${endPoint}`, parametros);

  return await respuesta.json();
}

function idMarcadorActivoValido(id) {
  return id !== undefined && id !== null ? String(id) : undefined;
}

/**
 * Realiza la consulta de la escena
 */
async function consultarEscena() {
  escena.cargando = true;
  // const respuesta = await gnoxyFetch(`${config.public.geonodeApi}/scenes/${escenaId}`);

  // const datos = await respuesta.json();
  const datos = await API(`scenes/${escenaId}`);

  escena.datos = datos;
  escena.idMarcadorActivo = idMarcadorActivoValido(datos.markers?.[0]?.id);
  gMarcadores.almacenados = datos.markers;
  delete escena.datos.markers;

  escena.cargando = false;
}
consultarEscena();

function crearMarca() {
  const nuevaMarca = {
    id: `nuevo-${Date.now()}`,
    scene: escenaId,
    lat: undefined,
    lng: undefined,
    title: 'Nuevo marcador',
    content: '',
    icon: String.fromCharCode(parseInt(pictogramas['ayuda'], 16)),
    color: 'pink',
  };
  gMarcadores.almacenar.push(nuevaMarca);
  escena.idMarcadorActivo = idMarcadorActivoValido(nuevaMarca.id);
}

const modal = reactive({ ...valoresModal });

function clickVista({ coordenadas }) {
  if (!escena.idMarcadorActivo) {
    crearMarca();
  }
  gMarcadores.byId(escena.idMarcadorActivo).lat = coordenadas[1].toFixed(10);
  gMarcadores.byId(escena.idMarcadorActivo).lng = coordenadas[0].toFixed(10);
}

function mostrarError({ errors }) {
  modal.cargando = false;
  modal.titulo = 'Error';
  modal.pictograma = 'cerrar';
  modal.mensaje = errors.join(` `);
  modal.permitirCerrar = true;
}

/**
 * Función ejecutada al dar submit en el formulario de la vista
 */
async function guardarCambios() {
  // console.table(toRaw(nuevaMarca));
  // marcadores.value.push({ ...nuevaMarca, id: marcadores.value.length });
  modal.visible = true;
  modal.cargando = true;

  for await (const marcador of gMarcadores.actualizar) {
    modal.mensaje = `Actualizando marcador ${marcador.title}`;
    const datos = await API(`scene-markers/${marcador.id}//`, 'PUT', marcador);
    if (datos?.success === false) {
      return mostrarError(datos);
    }
  }

  if (gMarcadores.almacenar.length) {
    modal.mensaje = `Almacenando nuevos marcadores`;
    const datos = await API(`scene-markers/bulk-add/${escenaId}//`, 'POST', gMarcadores.almacenar);
    if (datos?.success === false) {
      return mostrarError(datos);
    }
  }

  modal.titulo = 'Guardado con éxito';
  modal.cargando = false;
  modal.mensaje = '';
  await wait(1500);
  reloadNuxtApp();
}
</script>

<template>
  <form class="gestion-marcadores" @submit.prevent="guardarCambios">
    <section>
      <GeocontenidosTituloVolver
        :volver="`/geohistorias/${escenario}/escenas`"
        titulo="Agregar/Editar marcadores"
      />

      <p class="m-0">
        Agrega puntos de interés en el mapa de esta escena.
        {{ gMarcadores.visualizar.length }} marcador{{
          gMarcadores.visualizar.length !== 1 ? 'es' : ''
        }}
        en esta escena.
      </p>
    </section>

    <GeocontenidosLoader v-if="escena.cargando" />

    <section v-else class="flex m-b-3">
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
          :marcadores="gMarcadores.visualizar"
          @click-vista="clickVista"
        />

        <div v-if="escena.idMarcadorActivo" class="flex flex-contenido-separado" style="gap: 0">
          <fieldset class="columna-8">
            <label for="lng">Longitud</label>
            <input
              id="lng"
              v-model="gMarcadores.byId(escena.idMarcadorActivo).lng"
              type="number"
              step="any"
              max="180"
              min="-180"
              required
            />
          </fieldset>

          <fieldset class="columna-8">
            <label for="lat">Latitud</label>
            <input
              id="lat"
              v-model="gMarcadores.byId(escena.idMarcadorActivo).lat"
              type="number"
              step="any"
              max="90"
              min="-90"
              required
            />
          </fieldset>
        </div>
      </div>

      <div class="columna-8">
        <div class="flex flex-contenido-separado" style="align-items: center">
          <h3>Marcadores</h3>

          <button
            type="button"
            class="boton-primario boton-chico"
            style="height: fit-content"
            @click="crearMarca"
          >
            Agregar
            <span class="pictograma-agregar" aria-hidden="true" />
          </button>
        </div>

        <GeocontenidosPestanias
          :pestanias="gMarcadores.visualizar.map((m) => ({ id: String(m.id), titulo: m.title }))"
          :id-seleccion="String(escena.idMarcadorActivo)"
          @al-actualizar-seleccion="(id) => (escena.idMarcadorActivo = id)"
        >
          <template
            v-for="marcador in gMarcadores.visualizar"
            #[`contenido-${marcador.id}`]
            :key="`pestania-contenido-${marcador.id}`"
          >
            <fieldset>
              <label for="titulo">Titulo</label>
              <input id="titulo" v-model="marcador.title" type="text" required />
            </fieldset>

            <fieldset>
              <label>Descripción</label>
              <GeocontenidosEditor v-model="marcador.content" />
            </fieldset>

            <fieldset>
              <label for="icono">Icono</label>
              <select id="icono" v-model="marcador.icon" required>
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
              <input id="color" v-model="marcador.color" type="color" required />
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

      <!-- <input
        class="boton-secundario"
        :disabled="!gMarcadores.hayCambios"
        type="button"
        value="Restablecer"
      /> -->

      <input
        type="submit"
        class="boton-primario"
        value="Guardar"
        :disabled="!gMarcadores.hayCambios"
      />
    </section>

    <GeocontenidosLoaderModal v-bind="modal" />
    <!--
    <hr />
    {{ toRaw(escena) }}
    <hr />
    {{ gMarcadores }}
    <hr />
    id {{ escena.idMarcadorActivo }}: {{ gMarcadores.byId(escena.idMarcadorActivo) }}
    <hr />
    almacenadas: {{ gMarcadores.almacenados }}
    <hr />
    <b>actualizar:</b> {{ gMarcadores.actualizar }}
    <hr />
    <b>almacenar:</b> {{ gMarcadores.almacenar }}
    <hr />
    <b>eliminar:</b> {{ gMarcadores.eliminar }}
    <hr />
    -->
  </form>
</template>

<style lang="scss">
.gestion-marcadores {
  .sisdai-mapa.gema {
    height: inherit;
  }
}
</style>
