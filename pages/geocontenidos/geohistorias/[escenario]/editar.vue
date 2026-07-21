<script setup>
definePageMeta({ middleware: 'auth' });

import useApi from '~/composables/geocontenidos/useApi';
import { wait } from '~/utils/consulta';

const { escenario: escenario_id } = useRoute().params;
const escenario = reactive({
  description: '',
  is_public: false,
  name: '',
  scenes_layout_styles: {
    map_panel: 50,
    text_panel: 50,
    timeline_position: 'top',
    gradient_end: '#e755f7',
    gradient_start: '#9333ea',
  },
  url_id: '',
});
let valores_estaticos = '';

const { api, modal, mostrarModalCargando, mostrarModalError, mostrarModalExito } = useApi();

/**
 * Realiza la consulta de la escenario
 */
async function consultarEscenario() {
  if (escenario_id === 'nuevo') return;

  mostrarModalCargando('Cargando escenario...');

  const { respuesta, datos } = await api(`scenarios/${escenario_id}`);

  if (!respuesta.ok) {
    mostrarModalError([datos.detail]);
    modal.permitirCerrar = false;
    return;
  }

  Object.assign(escenario, datos);
  valores_estaticos = JSON.stringify(escenario);
  modal.visible = false;
}
consultarEscenario();

const nombre = computed({
  get: () => escenario.name,
  set(nuevoValor) {
    escenario.name = nuevoValor;
    escenario.url_id = nuevoValor
      .toLowerCase()
      .replace(/\s+/g, '-')
      // eslint-disable-next-line no-useless-escape
      .replace(/[^a-z0-9\-]/g, '');
  },
});

const distribucionLayout = computed({
  get: () => escenario.scenes_layout_styles.text_panel,
  set(nuevoValor) {
    escenario.scenes_layout_styles.text_panel = Number(nuevoValor);
    escenario.scenes_layout_styles.map_panel = 100 - nuevoValor;
  },
});

const datos_validos = computed(
  () =>
    !(
      valores_estaticos === JSON.stringify(escenario) ||
      escenario.name === '' ||
      escenario.description === ''
    )
);

const accion_guardar = ref('');
async function guardarCambios() {
  if (!datos_validos.value) return;
  mostrarModalCargando(`Almacenando información...`);

  const url = `scenarios/${escenario_id !== 'nuevo' ? `${escenario_id}/` : ''}/`;
  const { datos } = await api(url, escenario_id === 'nuevo' ? 'POST' : 'PUT', escenario);

  if (datos?.success === false) {
    mostrarModalError(datos.errors);
    return;
  }

  mostrarModalExito();
  await wait(1500);

  if (accion_guardar.value === 'recargar') {
    if (escenario_id === 'nuevo') {
      navigateTo(`/geocontenidos/geohistorias/${datos.id}/editar`);
    } else {
      reloadNuxtApp();
    }
  } else {
    navigateTo(`/geocontenidos/geohistorias/${datos.id}/escenas`);
  }
}
</script>

<template>
  <form @submit.prevent="guardarCambios">
    <section>
      <GeocontenidosTituloVolver volver="geohistorias/" titulo="Edición del escenario" />

      <div class="m-b-4">
        <label for="nombre">Nombre de la historia</label>
        <input
          id="nombre"
          v-model="nombre"
          type="text"
          placeholder="Ej: Análisis de Zonas Urbanas 2024"
          required
        />
        <p class="formulario-ayuda" aria-live="polite" role="status" />
      </div>

      <div class="m-b-4">
        <label for="descripcion">
          Descripción ({{ escenario.description.length }} / {{ 250 }})
        </label>
        <textarea
          id="descripcion"
          v-model="escenario.description"
          placeholder="Describa brevemente de qué trata este escenario"
          :maxlength="250"
          required
        />
        <p class="formulario-ayuda" aria-live="polite" role="status">
          Usa esta sección para una breve descripción que ayudará a otros a entender el propósito de
          este escenario
        </p>
      </div>

      <div class="m-b-4">
        <input id="casilla-identificadorgrupaluno" v-model="escenario.is_public" type="checkbox" />
        <label for="casilla-identificadorgrupaluno">Hacer público este escenario</label>
        <p class="formulario-ayuda" aria-live="polite" role="status">
          Si está marcada, cualquier usuario podrá ver este escenario.
        </p>
      </div>

      <div class="m-b-4">
        <label for="posicion">Posición de la línea del tiempo</label>
        <select id="posicion" v-model="escenario.scenes_layout_styles.timeline_position">
          <option value="top">Arriba</option>
          <option value="bottom">Abajo</option>
        </select>
      </div>
    </section>

    <section>
      <h2>Colores del Tema</h2>

      <p>Personaliza los colores de la línea del tiempo</p>

      <div class="flex flex-contenido-separado m-b-2">
        <div>
          <label for="color-primario">Color primario</label>
          <input
            id="color-primario"
            v-model="escenario.scenes_layout_styles.gradient_start"
            type="color"
            name="color-primario"
          />
        </div>

        <div>
          <label for="color-secundario">Color secundario</label>
          <input
            id="color-secundario"
            v-model="escenario.scenes_layout_styles.gradient_end"
            type="color"
            name="color-secundario"
          />
        </div>
      </div>

      <label>Vista previa del gradiente</label>
      <div
        class="borde borde-color-secundario borde-redondeado-8 m-b-4"
        :style="{
          background: `linear-gradient(to right, ${escenario.scenes_layout_styles.gradient_start}, ${escenario.scenes_layout_styles.gradient_end})`,
        }"
        style="height: 200px"
      />
    </section>

    <section>
      <h2>Distribución del layout</h2>

      <p>Ajusta el espacio que ocupará el panel de texto y el panel del mapa</p>

      <div>
        <label for="" class="flex flex-contenido-separado">
          <span>Panel de texto: {{ distribucionLayout }}%</span>
          <span>Panel del mapa: {{ escenario.scenes_layout_styles.map_panel }}%</span>
        </label>
        <input v-model="distribucionLayout" type="range" min="20" max="80" />
      </div>

      <div class="m-b-4">
        <label>Vista previa de la distribución</label>
        <div class="flex texto-tamanio-10" style="height: 200px; gap: 0">
          <span
            class="pictograma-reporte borde borde-color-secundario borde-l-redondeado-8 borde-r-redondeado-0"
            :style="{ width: escenario.scenes_layout_styles.text_panel + '%' }"
            style="align-items: center; justify-content: center"
          />
          <span
            class="pictograma-mexico borde borde-color-secundario borde-l-redondeado-0 borde-r-redondeado-8"
            style="flex: 1; align-items: center; justify-content: center"
          />
        </div>
      </div>
    </section>

    <section class="flex flex-contenido-final">
      <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario">Volver</NuxtLink>

      <button
        type="submit"
        class="boton-primario"
        :disabled="!datos_validos"
        @click="accion_guardar = 'recargar'"
      >
        Guardar
      </button>

      <button
        type="submit"
        class="boton-primario"
        :disabled="!datos_validos"
        @click="accion_guardar = 'escenas'"
      >
        Guardar y Editar escenas
      </button>
    </section>

    <GeocontenidosLoaderModal v-bind="modal" @al-cerrar="modal.visible = false" />
  </form>
</template>
