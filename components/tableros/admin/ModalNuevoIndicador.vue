<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';

const props = defineProps({
  siteId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['creado', 'cerrar']);

const { data: userData } = useAuth();
const { crearIndicador } = useTableroApi();

const modal = ref(null);
const paso = ref(1);
const guardando = ref(false);
const error = ref('');

const formulario = reactive({
  name: '',
  info_text: '',
  layer: '',
  layer_id_field: '',
  field_one: '',
  field_two: '',
  plot_type: 'bar',
  category_method: 'quantile',
  field_category: 5,
  colors: 'Reds',
  use_single_field: true,
  is_histogram: false,
});

async function guardar() {
  error.value = '';
  guardando.value = true;
  try {
    const payload = {
      site: props.siteId,
      group: null,
      subgroup: null,
      name: formulario.name,
      info_text: formulario.info_text,
      layer: formulario.layer ? Number(formulario.layer) : null,
      layer_id_field: formulario.layer_id_field,
      field_one: formulario.field_one,
      field_two: formulario.field_two || '',
      plot_type: formulario.plot_type,
      category_method: formulario.category_method,
      field_category: formulario.field_category,
      colors: formulario.colors,
      use_single_field: formulario.use_single_field,
      is_histogram: formulario.is_histogram,
      stack_order: 1,
    };
    const data = await crearIndicador(payload, userData.value?.accessToken);
    if (data?.id) {
      emit('creado', data);
      modal.value?.cerrarModal();
    } else {
      error.value = data?.detail || JSON.stringify(data);
    }
  } catch (e) {
    error.value = e?.message || 'Error al crear indicador';
  } finally {
    guardando.value = false;
  }
}

function siguiente() {
  if (paso.value < 3) paso.value += 1;
  else guardar();
}

function anterior() {
  if (paso.value > 1) paso.value -= 1;
}

onMounted(() => {
  modal.value?.abrirModal();
});

watch(
  () => modal.value,
  (m) => {
    if (m) m.abrirModal();
  }
);
</script>

<template>
  <ClientOnly>
    <SisdaiModal ref="modal" @cerrar="emit('cerrar')">
      <template #encabezado>
        <h2>Nuevo indicador — Paso {{ paso }} de 3</h2>
      </template>

      <template #cuerpo>
        <form @submit.prevent="siguiente">
          <section v-show="paso === 1">
            <h3>Datos del indicador</h3>

            <div class="m-b-2">
              <label for="ind-name">Nombre del indicador</label>
              <input id="ind-name" v-model="formulario.name" type="text" required />
            </div>

            <div class="m-b-2">
              <label for="ind-info">Descripción</label>
              <textarea id="ind-info" v-model="formulario.info_text" rows="2" />
            </div>

            <div class="m-b-2">
              <label for="ind-layer">ID de la capa (Dataset de GeoNode)</label>
              <input
                id="ind-layer"
                v-model="formulario.layer"
                type="number"
                placeholder="Ej: 42"
                required
              />
              <p class="formulario-ayuda">
                Identificador numérico del dataset asociado. Se puede obtener desde la URL del
                dataset en GeoNode.
              </p>
            </div>

            <div class="m-b-2">
              <label for="ind-field-id">Campo ID de la geometría</label>
              <input
                id="ind-field-id"
                v-model="formulario.layer_id_field"
                type="text"
                placeholder="Ej: cve_mun"
                required
              />
            </div>

            <div class="m-b-2">
              <label for="ind-field-one">Campo principal a visualizar</label>
              <input
                id="ind-field-one"
                v-model="formulario.field_one"
                type="text"
                placeholder="Ej: poblacion_total"
                required
              />
            </div>

            <div class="m-b-2">
              <label for="ind-field-two">Campo secundario (opcional)</label>
              <input id="ind-field-two" v-model="formulario.field_two" type="text" />
            </div>
          </section>

          <section v-show="paso === 2">
            <h3>Tematización</h3>

            <div class="m-b-2">
              <label for="ind-method">Método de clasificación</label>
              <select id="ind-method" v-model="formulario.category_method">
                <option value="quantile">Cuantiles</option>
                <option value="jenks">Jenks (natural breaks)</option>
                <option value="equal">Intervalos iguales</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div class="m-b-2">
              <label for="ind-categories">Número de clases</label>
              <input
                id="ind-categories"
                v-model.number="formulario.field_category"
                type="number"
                min="2"
                max="10"
              />
            </div>

            <div class="m-b-2">
              <label for="ind-colors">Rampa de color</label>
              <select id="ind-colors" v-model="formulario.colors">
                <option value="Reds">Rojos</option>
                <option value="Blues">Azules</option>
                <option value="Greens">Verdes</option>
                <option value="Oranges">Naranjas</option>
                <option value="Purples">Morados</option>
                <option value="Greys">Grises</option>
                <option value="YlOrRd">Amarillo → Rojo</option>
                <option value="BuPu">Azul → Morado</option>
              </select>
            </div>

            <div class="m-b-2">
              <label for="ind-plot-type">Tipo de gráfica</label>
              <select id="ind-plot-type" v-model="formulario.plot_type">
                <option value="bar">Barras</option>
                <option value="histogram">Histograma</option>
              </select>
            </div>
          </section>

          <section v-show="paso === 3">
            <h3>Confirmar</h3>
            <p>
              Se creará el indicador con los parámetros definidos. Los datos de gráfica y mapa
              podrán reconstruirse después desde la edición del indicador.
            </p>

            <ul>
              <li><b>Nombre:</b> {{ formulario.name }}</li>
              <li><b>Capa:</b> {{ formulario.layer }}</li>
              <li><b>Campo ID:</b> {{ formulario.layer_id_field }}</li>
              <li><b>Campo 1:</b> {{ formulario.field_one }}</li>
              <li><b>Método:</b> {{ formulario.category_method }}</li>
              <li><b>Clases:</b> {{ formulario.field_category }}</li>
              <li><b>Colores:</b> {{ formulario.colors }}</li>
            </ul>
          </section>

          <p v-if="error" class="color-error">{{ error }}</p>

          <div class="flex flex-contenido-separado">
            <div>
              <button
                v-if="paso > 1"
                type="button"
                class="boton boton-secundario"
                @click="anterior"
              >
                Atrás
              </button>
              <button type="button" class="boton boton-secundario" @click="emit('cerrar')">
                Cancelar
              </button>
            </div>

            <input
              type="submit"
              class="boton boton-primario"
              :value="paso < 3 ? 'Siguiente' : guardando ? 'Guardando...' : 'Crear indicador'"
              :disabled="guardando"
            />
          </div>
        </form>
      </template>
    </SisdaiModal>
  </ClientOnly>
</template>
