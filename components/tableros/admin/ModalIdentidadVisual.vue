<script setup>
const props = defineProps({
  siteId: { type: Number, required: true },
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
  modal.value?.abrir();
}

async function guardar() {
  guardando.value = true;
  try {
    await actualizarConfigSitio(props.siteId, config, userData.value?.accessToken);
    modal.value?.cerrar();
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
    <TablerosAdminModalBase ref="modal" ancho="820px">
      <template #encabezado>
        <h2>Identidad visual del sitio</h2>
      </template>

      <template #cuerpo>
        <form @submit.prevent="guardar">
          <!-- ── Tipografía ── -->
          <div class="seccion-titulo">Tipografía</div>
          <div class="form-grid-3">
            <div class="campo col-span-1">
              <label for="vis-fuente">Tipo de letra</label>
              <select id="vis-fuente" v-model="config.site_font_style">
                <option v-for="f in FUENTES" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
            <div class="campo">
              <label for="vis-size">Tamaño general (px)</label>
              <input
                id="vis-size"
                v-model.number="config.site_font_size"
                type="number"
                min="10"
                max="32"
              />
            </div>
            <div class="campo">
              <label for="vis-hsize">Tamaño encabezado (px)</label>
              <input
                id="vis-hsize"
                v-model.number="config.header_font_size"
                type="number"
                min="14"
                max="60"
              />
            </div>
          </div>
          <div class="campo m-t-2">
            <label for="vis-ibt">Título del recuadro de indicadores</label>
            <input id="vis-ibt" v-model="config.indicator_box_title" type="text" />
          </div>

          <!-- ── Colores ── -->
          <div class="seccion-titulo m-t-4">Colores</div>
          <div class="colores-grid">
            <div class="colores-seccion">
              <div class="colores-seccion__titulo">
                <label class="check-inline">
                  <input v-model="config.show_header" type="checkbox" />
                  Encabezado
                </label>
              </div>
              <div class="colores-seccion__fila">
                <div class="campo-color">
                  <label for="vis-h-bg">Fondo</label>
                  <input
                    id="vis-h-bg"
                    v-model="config.header_background_color"
                    type="color"
                    class="input-color"
                  />
                  <span class="color-hex">{{ config.header_background_color }}</span>
                </div>
                <div class="campo-color">
                  <label for="vis-h-text">Texto</label>
                  <input
                    id="vis-h-text"
                    v-model="config.header_text_color"
                    type="color"
                    class="input-color"
                  />
                  <span class="color-hex">{{ config.header_text_color }}</span>
                </div>
              </div>
            </div>

            <div class="colores-seccion">
              <div class="colores-seccion__titulo">Contenedores (widgets)</div>
              <div class="colores-seccion__fila">
                <div class="campo-color">
                  <label for="vis-c-bg">Fondo</label>
                  <input
                    id="vis-c-bg"
                    v-model="config.site_interface_background_color"
                    type="color"
                    class="input-color"
                  />
                  <span class="color-hex">{{ config.site_interface_background_color }}</span>
                </div>
                <div class="campo-color">
                  <label for="vis-c-text">Texto</label>
                  <input
                    id="vis-c-text"
                    v-model="config.site_interface_text_color"
                    type="color"
                    class="input-color"
                  />
                  <span class="color-hex">{{ config.site_interface_text_color }}</span>
                </div>
              </div>
            </div>

            <div class="colores-seccion">
              <div class="colores-seccion__titulo">
                <label class="check-inline">
                  <input v-model="config.show_footer" type="checkbox" />
                  Pie de página
                </label>
              </div>
              <div class="colores-seccion__fila">
                <div class="campo-color">
                  <label for="vis-f-bg">Fondo</label>
                  <input
                    id="vis-f-bg"
                    v-model="config.site_background_color"
                    type="color"
                    class="input-color"
                  />
                  <span class="color-hex">{{ config.site_background_color }}</span>
                </div>
                <div class="campo-color">
                  <label for="vis-f-text">Texto</label>
                  <input
                    id="vis-f-text"
                    v-model="config.site_text_color"
                    type="color"
                    class="input-color"
                  />
                  <span class="color-hex">{{ config.site_text_color }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="acciones-modal">
            <button type="button" class="boton boton-secundario" @click="modal?.cerrar()">
              Cancelar
            </button>
            <input
              type="submit"
              class="boton boton-primario"
              :value="guardando ? 'Guardando...' : 'Guardar cambios'"
              :disabled="guardando"
            />
          </div>
        </form>
      </template>
    </TablerosAdminModalBase>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.seccion-titulo {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-texto-secundario, #777);
  border-bottom: 1px solid var(--color-borde, #e8e8e8);
  padding-bottom: 4px;
  margin-bottom: 1rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.check-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

/* Grid de secciones de color (3 columnas) */
.colores-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.colores-seccion {
  border: 1px solid var(--color-borde, #e0e0e0);
  border-radius: 8px;
  overflow: hidden;

  &__titulo {
    padding: 8px 12px;
    background: var(--color-fondo-2, #fafafa);
    border-bottom: 1px solid var(--color-borde, #e0e0e0);
    font-weight: 600;
    font-size: 0.85rem;
  }

  &__fila {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
}

.campo-color {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-borde, #f0f0f0);

  &:last-child {
    border-bottom: none;
  }

  label {
    font-size: 0.82rem;
    color: var(--color-texto-secundario, #666);
    width: 40px;
    flex-shrink: 0;
  }
}

.input-color {
  width: 40px;
  height: 32px;
  padding: 2px;
  border: 1px solid var(--color-borde, #ccc);
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-hex {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--color-texto-secundario, #888);
}

/* Acciones */
.acciones-modal {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-borde, #e8e8e8);
}
</style>
