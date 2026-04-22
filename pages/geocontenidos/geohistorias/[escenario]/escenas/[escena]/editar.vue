<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import {
  // SisdaiCapaArcgis,
  // SisdaiCapaWms,
  SisdaiCapaXyz,
  // SisdaiLeyendaArcgis,
  // SisdaiLeyendaWms,
  SisdaiMapa,
} from '@centrogeomx/sisdai-mapas';

const config = useRuntimeConfig();
const { data: userData } = useAuth();
const { gnoxyFetch } = useGnoxyUrl();
const { escenario, escena } = useRoute().params;

const modalStatus = ref(null);
const estatusAlGuardar = reactive({
  cargando: false,
  estado: undefined,
  mensaje: '',
  textoCargando: '',
});
const formulario = reactive({
  name: '',
  text_content: '',
  scenario: escenario,
  text_position: '',
  map_center_lat: null,
  map_center_long: null,
  zoom: null,
});

async function cargarDatosEscenario() {
  if (escenario === 'nuevo') return;

  const url = `${config.public.geonodeApi}/scenes/${escena}`;
  // console.log('consultar', url);

  const respuesta = await gnoxyFetch(url);
  const data = await respuesta.json();
  Object.assign(formulario, data);
  // console.log(data);
}
cargarDatosEscenario();

async function guardarCambios() {
  // Aquí iría la lógica para guardar los cambios realizados en el escenario
  formulario.zoom = ~~Number(formulario.zoom);
  // console.log('Cambios guardados:', toRaw(formulario));
  modalStatus.value?.abrirModal();
  estatusAlGuardar.cargando = true;
  estatusAlGuardar.textoCargando = 'Guardando...';

  const url = `${config.public.geonodeApi}/scenes/${escena !== 'nuevo' ? `${escena}/` : ''}/`;
  // console.log(url);
  const respuesta = await gnoxyFetch(url, {
    method: escena === 'nuevo' ? 'POST' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userData.value?.accessToken}`,
    },
    body: JSON.stringify(formulario),
  });

  if (escena === 'nuevo') {
    if (!respuesta.ok || respuesta.status !== 201 || respuesta.statusText !== 'Created') {
      console.error('Error al guardar la escena:', respuesta.statusText);
    }
  } else if (!respuesta.ok || respuesta.status !== 200) {
    console.error('Error al guardar la escena:', respuesta.statusText);
  }

  const data = await respuesta.json();
  // console.log(data);

  // if (Object.hasOwn(data, 'success') && data.success === false) {
  if (data?.success === false) {
    estatusAlGuardar.cargando = false;
    estatusAlGuardar.mensaje = data.errors.join(` `);
    estatusAlGuardar.estado = data.success;
  } else {
    estatusAlGuardar.cargando = false;
    estatusAlGuardar.estado = true;
    setTimeout(() => {
      modalStatus.value?.cerrarModal();

      if (escena === 'nuevo') {
        navigateTo(`/geocontenidos/geohistorias/${escenario}/escenas/${data.id}/editar`);
      }
    }, 1500);
  }
}

function alMoverVista({ acercamiento, centro }) {
  // console.log(acercamiento, centro);
  formulario.map_center_long = centro[0];
  formulario.map_center_lat = centro[1];
  formulario.zoom = acercamiento;
}
const vistaDelMapa = computed(() => {
  const vista = { acercamiento: formulario.zoom || 2 };

  if (formulario.map_center_long && formulario.map_center_lat) {
    vista.centro = [formulario.map_center_long, formulario.map_center_lat];
  } else {
    vista.extension = '-118.3651,14.5321,-86.7104,32.7187';
  }

  return vista;
});
</script>

<template>
  <form @submit.prevent="guardarCambios">
    <section class="flex p-y-3">
      <NuxtLink
        :to="`/geocontenidos/geohistorias/${escenario}/escenas`"
        class="boton boton-secundario boton-chico"
      >
        <span class="pictograma-flecha-izquierda m-r-1" />
      </NuxtLink>

      <h2 class="m-0">Edición de la escena</h2>
    </section>

    <section>
      <div class="m-b-4">
        <label for="nombre">Nombre de la escena</label>
        <input
          id="nombre"
          v-model="formulario.name"
          type="text"
          placeholder="Ej: Vista general del área de estudio"
          required
        />
      </div>

      <div class="m-b-4">
        <label>Contenido de la escena</label>
        <GeocontenidosEditor v-model="formulario.text_content" />
        <!-- <textarea
          id="descripcion"
          v-model="formulario.text_content"
          placeholder="Escribe el contenido narrativo de la escena"
          required
        /> -->
      </div>

      <div class="m-b-4">
        <label for="posicion">Posición del texto</label>
        <select id="posicion" v-model="formulario.text_position">
          <option value="left">Isquierda</option>
          <option value="right">Derecha</option>
        </select>
      </div>
    </section>

    <section class="m-b-4">
      <h2>Vista previa interactiva</h2>

      <p>Arrastra el mapa y zoom para ajustar la vista</p>

      <ClientOnly>
        <SisdaiMapa :vista="vistaDelMapa" @al-mover-vista="alMoverVista">
          <template #panel-encabezado-vis>
            <ul class="lista-sin-estilo">
              <li>Latitud: {{ formulario.map_center_lat }}</li>
              <li>Longitud: {{ formulario.map_center_long }}</li>
              <li>Nivel de acercamiento: {{ formulario.zoom }}</li>
            </ul>
          </template>

          <SisdaiCapaXyz
            :posicion="0"
            fuente="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </SisdaiMapa>
      </ClientOnly>
    </section>

    <section class="flex flex-contenido-final">
      <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario">Volver</NuxtLink>

      <input type="submit" class="boton-primario" value="Guardar" />
    </section>

    <ClientOnly>
      <SisdaiModal ref="modalStatus">
        <template #encabezado>
          <span v-if="estatusAlGuardar.cargando" />
          <h2 v-else>{{ estatusAlGuardar.estado ? 'Guardado con éxito' : 'Error' }}</h2>
        </template>

        <template #cuerpo>
          <GeocontenidosLoader
            v-if="estatusAlGuardar.cargando"
            :mensaje="estatusAlGuardar.textoCargando"
          />

          <p v-else-if="estatusAlGuardar.estado === false" v-text="estatusAlGuardar.mensaje" />

          <p v-else>
            <span class="pictograma-aprobado pictograma-grande" />
          </p>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </form>
</template>
