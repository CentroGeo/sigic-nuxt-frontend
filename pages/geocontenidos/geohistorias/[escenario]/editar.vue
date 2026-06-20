<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const config = useRuntimeConfig();
const { data: userData } = useAuth();
const { gnoxyFetch } = useGnoxyUrl();
const { escenario } = useRoute().params;

const modalStatus = ref(null);
const estatusAlGuardar = reactive({
  cargando: false,
  estado: undefined,
  mensaje: '',
  textoCargando: '',
});
const formulario = reactive({
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

async function cargarDatosEscenario() {
  if (escenario === 'nuevo') return;

  estatusAlGuardar.cargando = true;
  estatusAlGuardar.textoCargando = 'Cargando escenario...';
  modalStatus.value.abrirModal();

  const url = `${config.public.geonodeApi}/scenarios/${escenario}`;
  const respuesta = await gnoxyFetch(url);
  const data = await respuesta.json();

  // TODO: mostrar error si la respuesta no es ok o el escenario no existe

  // console.log(data);
  formulario.description = data.description;
  formulario.is_public = data.is_public;
  formulario.name = data.name;
  formulario.scenes_layout_styles = data.scenes_layout_styles;
  formulario.url_id = data.url_id;

  estatusAlGuardar.cargando = false;
  modalStatus.value.cerrarModal();
}
watch(modalStatus, cargarDatosEscenario);

const nombre = computed({
  get: () => formulario.name,
  set(nuevoValor) {
    formulario.name = nuevoValor;
    formulario.url_id = nuevoValor
      .toLowerCase()
      .replace(/\s+/g, '-')
      // eslint-disable-next-line no-useless-escape
      .replace(/[^a-z0-9\-]/g, '');
  },
});

const distribucionLayout = computed({
  get: () => formulario.scenes_layout_styles.text_panel,
  set(nuevoValor) {
    formulario.scenes_layout_styles.text_panel = Number(nuevoValor);
    formulario.scenes_layout_styles.map_panel = 100 - nuevoValor;
  },
});

async function guardarCambios() {
  // Aquí iría la lógica para guardar los cambios realizados en el escenario
  // console.log('Cambios guardados:', toRaw(formulario));
  modalStatus.value?.abrirModal();
  estatusAlGuardar.cargando = true;
  estatusAlGuardar.textoCargando = 'Guardando...';

  const respuesta = await gnoxyFetch(
    `${config.public.geonodeApi}/scenarios/${escenario !== 'nuevo' ? `${escenario}/` : ''}/`,
    {
      method: escenario === 'nuevo' ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userData.value?.accessToken}`,
      },
      body: JSON.stringify(formulario),
    }
  );

  if (escenario === 'nuevo') {
    if (!respuesta.ok || respuesta.status !== 201 || respuesta.statusText !== 'Created') {
      console.error('Error al guardar el escenario:', respuesta.statusText);
    }
  } else {
    if (!respuesta.ok || respuesta.status !== 200) {
      console.error('Error al guardar el escenario:', respuesta.statusText);
    }
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

      if (escenario === 'nuevo') {
        navigateTo(`/geocontenidos/geohistorias/${data.id}/editar`);
      }
    }, 1500);
  }
}
</script>

<template>
  <form @submit.prevent="guardarCambios">
    <section>
      <div class="flex p-y-3">
        <NuxtLink to="/geocontenidos/geohistorias" class="boton boton-secundario boton-chico">
          <span class="pictograma-flecha-izquierda m-r-1" />
        </NuxtLink>

        <h2 class="m-0">Edición del escenario</h2>
      </div>

      <div class="m-b-4">
        <label for="nombre">Nombre de la historia</label>
        <input
          id="nombre"
          v-model="nombre"
          type="text"
          placeholder="Ej: Análisis de Zonas Urbanas 2024"
          required
        />
      </div>

      <div class="m-b-4">
        <label for="descripcion">
          Descripción ({{ formulario.description.length }} / {{ 250 }})
        </label>
        <textarea
          id="descripcion"
          v-model="formulario.description"
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
        <input id="casilla-identificadorgrupaluno" v-model="formulario.is_public" type="checkbox" />
        <label for="casilla-identificadorgrupaluno">Hacer público este escenario</label>
        <p class="formulario-ayuda" aria-live="polite" role="status">
          Si está marcada, cualquier usuario podrá ver este escenario.
        </p>
      </div>

      <div class="m-b-4">
        <label for="posicion">Posición de la línea del tiempo</label>
        <select id="posicion" v-model="formulario.scenes_layout_styles.timeline_position">
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
            v-model="formulario.scenes_layout_styles.gradient_start"
            type="color"
            name="color-primario"
          />
        </div>

        <div>
          <label for="color-secundario">Color secundario</label>
          <input
            id="color-secundario"
            v-model="formulario.scenes_layout_styles.gradient_end"
            type="color"
            name="color-secundario"
          />
        </div>
      </div>

      <label>Vista previa del gradiente</label>
      <div
        class="borde borde-color-secundario borde-redondeado-8 m-b-4"
        :style="{
          background: `linear-gradient(to right, ${formulario.scenes_layout_styles.gradient_start}, ${formulario.scenes_layout_styles.gradient_end})`,
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
          <span>Panel del mapa: {{ formulario.scenes_layout_styles.map_panel }}%</span>
        </label>
        <input v-model="distribucionLayout" type="range" min="20" max="80" />
      </div>

      <div class="m-b-4">
        <label>Vista previa de la distribución</label>
        <div class="flex texto-tamanio-10" style="height: 200px; gap: 0">
          <span
            class="pictograma-reporte borde borde-color-secundario borde-l-redondeado-8 borde-r-redondeado-0"
            :style="{ width: formulario.scenes_layout_styles.text_panel + '%' }"
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

      <input type="submit" class="boton-primario" value="Guardar" />

      <button class="boton-primario" @click="modalStatus?.abrirModal()">
        Guardar y Editar escenas
      </button>
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

          <p v-else><span class="pictograma-aprobado pictograma-grande" /></p>
        </template>
      </SisdaiModal>
    </ClientOnly>
  </form>
</template>
