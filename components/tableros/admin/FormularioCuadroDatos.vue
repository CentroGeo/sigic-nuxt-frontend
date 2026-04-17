<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const props = defineProps({
  indicadorId: {
    type: Number,
    required: true,
  },
  cuadro: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['guardado', 'cerrar']);

const { data: userData } = useAuth();
const { crearCuadroDatos, actualizarCuadroDatos } = useTableroApi();

const modal = ref(null);
const guardando = ref(false);
const error = ref('');
const previewIcono = ref(null);

const esEdicion = computed(() => !!props.cuadro);

const formulario = reactive({
  field: '',
  name: '',
  is_percentage: false,
  field_percentage_total: '',
  color: '#691c32',
  text_color: '#ffffff',
  edge_color: '#691c32',
  edge_style: '8',
  size: '1',
  icon: '',
  icon_custom_file: null,
  stack_order: 1,
});

const TAMANIOS = [
  { value: '1', label: 'Normal (SM)' },
  { value: '2', label: 'Grande (MD)' },
  { value: '3', label: 'Extra grande (LG)' },
];

const BORDES = [
  { value: '8', label: 'Sin bordes' },
  { value: '1', label: 'Izquierdo' },
  { value: '2', label: 'Derecho' },
  { value: '3', label: 'Superior' },
  { value: '4', label: 'Inferior' },
  { value: '5', label: 'Paralelos horizontales' },
  { value: '6', label: 'Paralelos verticales' },
  { value: '7', label: 'Borde completo' },
];

function cargarDesdeCuadro() {
  if (!props.cuadro) return;
  formulario.field = props.cuadro.field || '';
  formulario.name = props.cuadro.name || '';
  formulario.is_percentage = !!props.cuadro.is_percentage;
  formulario.field_percentage_total = props.cuadro.field_percentage_total || '';
  formulario.color = props.cuadro.color || '#691c32';
  formulario.text_color = props.cuadro.text_color || '#ffffff';
  formulario.edge_color = props.cuadro.edge_color || '#691c32';
  formulario.edge_style = props.cuadro.edge_style || '8';
  formulario.size = props.cuadro.size || '1';
  formulario.icon = props.cuadro.icon || '';
  formulario.stack_order = props.cuadro.stack_order || 1;
}

function onArchivoIcono(event) {
  const archivo = event.target.files?.[0];
  if (!archivo) return;
  formulario.icon_custom_file = archivo;
  previewIcono.value = URL.createObjectURL(archivo);
}

async function guardar() {
  error.value = '';
  guardando.value = true;

  const form = new FormData();
  form.append('indicator', String(props.indicadorId));
  form.append('field', formulario.field);
  form.append('name', formulario.name);
  form.append('is_percentage', formulario.is_percentage ? 'true' : 'false');
  if (formulario.field_percentage_total)
    form.append('field_percentage_total', formulario.field_percentage_total);
  form.append('color', formulario.color);
  form.append('text_color', formulario.text_color);
  form.append('edge_color', formulario.edge_color);
  form.append('edge_style', formulario.edge_style);
  form.append('size', formulario.size);
  if (formulario.icon) form.append('icon', formulario.icon);
  if (formulario.icon_custom_file) form.append('icon_custom', formulario.icon_custom_file);
  form.append('stack_order', String(formulario.stack_order));

  try {
    const token = userData.value?.accessToken;
    const data = esEdicion.value
      ? await actualizarCuadroDatos(props.cuadro.id, form, token)
      : await crearCuadroDatos(form, token);

    if (data?.id) {
      emit('guardado', data);
      modal.value?.cerrarModal();
    } else {
      error.value = data?.detail || JSON.stringify(data);
    }
  } catch (e) {
    error.value = e?.message || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
}

onMounted(() => {
  cargarDesdeCuadro();
  modal.value?.abrirModal();
});
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal" @cerrar="emit('cerrar')">
      <template #encabezado>
        <h2>{{ esEdicion ? 'Editar' : 'Crear' }} cuadro de datos</h2>
      </template>

      <template #cuerpo>
        <form @submit.prevent="guardar">
          <div class="m-b-2">
            <label for="cd-field">Campo de información</label>
            <input
              id="cd-field"
              v-model="formulario.field"
              type="text"
              placeholder="Ej: poblacion_total"
              required
            />
          </div>

          <div class="m-b-2">
            <label for="cd-name">Nombre personalizado</label>
            <input id="cd-name" v-model="formulario.name" type="text" required />
          </div>

          <div class="m-b-2">
            <input id="cd-percentage" v-model="formulario.is_percentage" type="checkbox" />
            <label for="cd-percentage">¿Es porcentual?</label>
          </div>

          <div v-if="formulario.is_percentage" class="m-b-2">
            <label for="cd-total">Campo total para calcular porcentaje</label>
            <input id="cd-total" v-model="formulario.field_percentage_total" type="text" />
          </div>

          <div class="flex flex-contenido-separado m-b-2">
            <div>
              <label for="cd-color">Color de fondo</label>
              <input id="cd-color" v-model="formulario.color" type="color" />
            </div>
            <div>
              <label for="cd-text">Color de texto</label>
              <input id="cd-text" v-model="formulario.text_color" type="color" />
            </div>
            <div>
              <label for="cd-edge-color">Color de borde</label>
              <input id="cd-edge-color" v-model="formulario.edge_color" type="color" />
            </div>
          </div>

          <div class="flex flex-contenido-separado m-b-2">
            <div>
              <label for="cd-size">Tamaño</label>
              <select id="cd-size" v-model="formulario.size">
                <option v-for="t in TAMANIOS" :key="t.value" :value="t.value">
                  {{ t.label }}
                </option>
              </select>
            </div>

            <div>
              <label for="cd-edge">Estilo de borde</label>
              <select id="cd-edge" v-model="formulario.edge_style">
                <option v-for="b in BORDES" :key="b.value" :value="b.value">{{ b.label }}</option>
              </select>
            </div>
          </div>

          <div class="m-b-2">
            <label for="cd-icon">Icono (clase Font Awesome / Material)</label>
            <input
              id="cd-icon"
              v-model="formulario.icon"
              type="text"
              placeholder="Ej: fas fa-users"
            />
          </div>

          <div class="m-b-2">
            <label for="cd-icon-custom">O subir icono personalizado</label>
            <input id="cd-icon-custom" type="file" accept="image/*" @change="onArchivoIcono" />
            <img
              v-if="previewIcono"
              :src="previewIcono"
              alt="Preview"
              style="width: 40px; height: 40px; margin-top: 0.5rem"
            />
          </div>

          <section class="m-b-3">
            <h4>Vista previa</h4>
            <div
              :style="{
                background: formulario.color,
                color: formulario.text_color,
                borderColor: formulario.edge_color,
                padding: '1rem',
                borderRadius: '8px',
                borderWidth: '2px',
                borderStyle: 'solid',
                maxWidth: '240px',
              }"
            >
              <div style="display: flex; align-items: center; gap: 0.5rem">
                <span v-if="formulario.icon" :class="formulario.icon" style="font-size: 1.5rem" />
                <strong>{{ formulario.name || 'Nombre' }}</strong>
              </div>
              <p style="margin: 0.3rem 0 0; font-size: 0.85rem">
                {{ formulario.field || 'campo' }}
                {{ formulario.is_percentage ? '(%)' : '' }}
              </p>
            </div>
          </section>

          <p v-if="error" class="color-error">{{ error }}</p>

          <div class="flex flex-contenido-separado">
            <button type="button" class="boton boton-secundario" @click="emit('cerrar')">
              Cancelar
            </button>
            <input
              type="submit"
              class="boton boton-primario"
              :value="guardando ? 'Guardando...' : 'Guardar'"
              :disabled="guardando"
            />
          </div>
        </form>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
