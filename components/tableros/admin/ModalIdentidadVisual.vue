<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const props = defineProps({
  siteId: {
    type: Number,
    required: true,
  },
});

const { data: userData } = useAuth();
const { fetchConfigSitio, actualizarConfigSitio } = useTableroApi();

const modal = ref(null);
const guardando = ref(false);

const FUENTES = [
  'Roboto',
  'Poppins',
  'Nunito',
  'Lato',
  'Aleo',
  'Montserrat',
  'Source Sans Pro',
  'Merriweather',
  'Oswald',
  'Rubik',
];

const config = reactive({
  show_header: true,
  show_footer: true,
  header_background_color: '#691c32',
  header_text_color: '#ffffff',
  header_font_size: 28,
  site_font_style: 'Roboto',
  site_text_color: '#333333',
  site_background_color: '#f5f5f5',
  site_interface_text_color: '#333333',
  site_interface_background_color: '#ffffff',
  site_font_size: 16,
  indicator_box_title: 'Indicador',
});

async function cargar() {
  try {
    const data = await fetchConfigSitio(props.siteId);
    if (data) Object.assign(config, data);
  } catch (e) {
    console.error('Error al cargar configuración:', e);
  }
}

async function abrir() {
  await cargar();
  modal.value?.abrirModal();
}

async function guardar() {
  guardando.value = true;
  try {
    await actualizarConfigSitio(props.siteId, config, userData.value?.accessToken);
    modal.value?.cerrarModal();
  } catch (e) {
    console.error('Error al guardar configuración:', e);
  } finally {
    guardando.value = false;
  }
}

defineExpose({ abrir });
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal">
      <template #encabezado>
        <h2>Identidad visual del sitio</h2>
      </template>

      <template #cuerpo>
        <form @submit.prevent="guardar">
          <section class="m-b-4">
            <h3>Configuración global</h3>

            <div class="m-b-3">
              <label for="modal-vis-fuente">Tipo de letra</label>
              <select id="modal-vis-fuente" v-model="config.site_font_style">
                <option v-for="f in FUENTES" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>

            <div class="flex flex-contenido-separado m-b-3">
              <div>
                <label for="modal-vis-size">Tamaño de fuente general (px)</label>
                <input
                  id="modal-vis-size"
                  v-model.number="config.site_font_size"
                  type="number"
                  min="10"
                  max="32"
                />
              </div>

              <div>
                <label for="modal-vis-hsize">Tamaño de fuente del encabezado (px)</label>
                <input
                  id="modal-vis-hsize"
                  v-model.number="config.header_font_size"
                  type="number"
                  min="14"
                  max="60"
                />
              </div>
            </div>

            <div class="m-b-3">
              <label for="modal-vis-ibt">Título del recuadro de indicadores</label>
              <input id="modal-vis-ibt" v-model="config.indicator_box_title" type="text" />
            </div>
          </section>

          <section class="m-b-4">
            <h3>Encabezado</h3>
            <div class="m-b-2">
              <input id="modal-vis-show-header" v-model="config.show_header" type="checkbox" />
              <label for="modal-vis-show-header">Mostrar encabezado</label>
            </div>

            <div class="flex flex-contenido-separado m-b-2">
              <div>
                <label for="modal-vis-h-bg">Color de fondo</label>
                <input id="modal-vis-h-bg" v-model="config.header_background_color" type="color" />
              </div>

              <div>
                <label for="modal-vis-h-text">Color de texto</label>
                <input id="modal-vis-h-text" v-model="config.header_text_color" type="color" />
              </div>
            </div>
          </section>

          <section class="m-b-4">
            <h3>Contenedores (widgets)</h3>
            <div class="flex flex-contenido-separado m-b-2">
              <div>
                <label for="modal-vis-c-bg">Fondo del widget</label>
                <input
                  id="modal-vis-c-bg"
                  v-model="config.site_interface_background_color"
                  type="color"
                />
              </div>

              <div>
                <label for="modal-vis-c-text">Texto del widget</label>
                <input
                  id="modal-vis-c-text"
                  v-model="config.site_interface_text_color"
                  type="color"
                />
              </div>
            </div>
          </section>

          <section class="m-b-4">
            <h3>Pie de página</h3>

            <div class="m-b-2">
              <input id="modal-vis-show-footer" v-model="config.show_footer" type="checkbox" />
              <label for="modal-vis-show-footer">Mostrar pie de página</label>
            </div>

            <div class="flex flex-contenido-separado m-b-2">
              <div>
                <label for="modal-vis-f-bg">Color de fondo</label>
                <input id="modal-vis-f-bg" v-model="config.site_background_color" type="color" />
              </div>

              <div>
                <label for="modal-vis-f-text">Color de texto</label>
                <input id="modal-vis-f-text" v-model="config.site_text_color" type="color" />
              </div>
            </div>
          </section>

          <section class="flex flex-contenido-final">
            <button type="button" class="boton boton-secundario" @click="modal?.cerrarModal()">
              Cancelar
            </button>
            <input
              type="submit"
              class="boton boton-primario"
              :value="guardando ? 'Guardando...' : 'Guardar'"
              :disabled="guardando"
            />
          </section>
        </form>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
