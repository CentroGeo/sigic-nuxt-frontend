<script setup>
const props = defineProps({
  indicador: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['guardado', 'cerrar']);

const { data: userData } = useAuth();
const { actualizarIndicador } = useTableroApi();

const modal = ref(null);
const guardando = ref(false);
const error = ref('');

const PALETAS = [
  { value: 'azules_3', label: 'Azules' },
  { value: 'cafes', label: 'Cafés' },
  { value: 'morados', label: 'Morados' },
  { value: 'verdes_2', label: 'Verdes' },
  { value: 'naranjas', label: 'Naranjas' },
  { value: 'rosas', label: 'Rosas' },
  { value: 'varios', label: 'Multicolor' },
  { value: 'semaforo', label: 'Semáforo' },
  { value: 'semaforo_3', label: 'Semáforo 3 tonos' },
];

const TIPOS_GRAFICA = [
  {
    group: 'Barras',
    options: [
      { value: 'bar', label: 'Barras verticales' },
      { value: 'horizontal_bar', label: 'Barras horizontales' },
      { value: 'histogram', label: 'Histograma' },
    ],
  },
  {
    group: 'Circular',
    options: [
      { value: 'donut', label: 'Dona' },
      { value: 'pie', label: 'Pastel (pie)' },
    ],
  },
  {
    group: 'Líneas y área',
    options: [
      { value: 'line', label: 'Línea' },
      { value: 'area', label: 'Área' },
    ],
  },
  {
    group: 'Otros',
    options: [
      { value: 'scatter', label: 'Dispersión (scatter)' },
      { value: 'gauge', label: 'Gauge' },
      { value: 'radar', label: 'Radar' },
      { value: 'treemap', label: 'Mapa de árbol' },
    ],
  },
];

const METODOS = [
  { value: 'quantile', label: 'Cuantiles' },
  { value: 'jenks', label: 'Jenks (natural breaks)' },
  { value: 'equal', label: 'Intervalos iguales' },
  { value: 'manual', label: 'Manual' },
];

const formulario = reactive({
  name: '',
  info_text: '',
  plot_type: 'bar',
  colors: 'azules_3',
  reverse_colors: false,
  category_method: 'quantile',
  field_category: 5,
  use_single_field: true,
  show_general_values: false,
  high_values_percentage: 10,
});

function cargarDesdeIndicador() {
  formulario.name = props.indicador.name || '';
  formulario.info_text = props.indicador.info_text || '';
  formulario.plot_type = props.indicador.plot_type || 'bar';
  const rawColors = props.indicador.colors || 'azules_3';
  formulario.reverse_colors = rawColors.endsWith('_r');
  formulario.colors = formulario.reverse_colors ? rawColors.slice(0, -2) : rawColors;
  formulario.category_method = props.indicador.category_method || 'quantile';
  formulario.field_category = props.indicador.field_category ?? 5;
  formulario.use_single_field = props.indicador.use_single_field ?? true;
  formulario.show_general_values = props.indicador.show_general_values ?? false;
  formulario.high_values_percentage = props.indicador.high_values_percentage ?? 10;
}

watch(
  () => modal.value,
  (m) => {
    if (m) {
      cargarDesdeIndicador();
      m.abrir();
    }
  },
  { once: true }
);

async function guardar() {
  error.value = '';
  guardando.value = true;
  try {
    const token = userData.value?.accessToken;
    const colorsValue = formulario.reverse_colors ? `${formulario.colors}_r` : formulario.colors;

    const payload = {
      name: formulario.name,
      info_text: formulario.info_text,
      plot_type: formulario.plot_type,
      colors: colorsValue,
      category_method: formulario.category_method,
      field_category: formulario.field_category,
      use_single_field: formulario.use_single_field,
      show_general_values: formulario.show_general_values,
      high_values_percentage: formulario.high_values_percentage,
    };

    const data = await actualizarIndicador(props.indicador.id, payload, token);
    if (data?.id) {
      emit('guardado', data);
      modal.value?.cerrar();
    } else {
      error.value = data?.detail || JSON.stringify(data);
    }
  } catch (e) {
    error.value = e?.message || 'Error al guardar';
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <ClientOnly>
    <TablerosAdminModalBase ref="modal" ancho="720px" @cerrar="emit('cerrar')">
      <template #encabezado>
        <h2>Editar indicador</h2>
      </template>

      <template #cuerpo>
        <form @submit.prevent="guardar">
          <!-- ── Identificación ── -->
          <div class="seccion-titulo">Identificación</div>
          <div class="campo m-b-2">
            <label for="ind-nombre">Nombre del indicador <span class="requerido">*</span></label>
            <input id="ind-nombre" v-model="formulario.name" type="text" required />
          </div>
          <div class="campo">
            <label for="ind-info">Texto descriptivo</label>
            <textarea
              id="ind-info"
              v-model="formulario.info_text"
              rows="3"
              placeholder="Descripción del indicador, metodología, fuente..."
            />
          </div>

          <!-- ── Visualización ── -->
          <div class="seccion-titulo m-t-4">Visualización</div>
          <div class="form-grid-2">
            <div class="campo">
              <label for="ind-tipo">Tipo de gráfica</label>
              <select id="ind-tipo" v-model="formulario.plot_type">
                <optgroup v-for="g in TIPOS_GRAFICA" :key="g.group" :label="g.group">
                  <option v-for="t in g.options" :key="t.value" :value="t.value">
                    {{ t.label }}
                  </option>
                </optgroup>
              </select>
            </div>
            <div class="campo">
              <label for="ind-paleta">Paleta de colores</label>
              <select id="ind-paleta" v-model="formulario.colors">
                <option v-for="p in PALETAS" :key="p.value" :value="p.value">
                  {{ p.label }}
                </option>
              </select>
              <label class="check-inline m-t-1">
                <input v-model="formulario.reverse_colors" type="checkbox" />
                Invertir paleta
              </label>
            </div>
          </div>

          <!-- ── Clasificación ── -->
          <div class="seccion-titulo m-t-4">Clasificación</div>
          <div class="form-grid-2">
            <div class="campo">
              <label for="ind-method">Método</label>
              <select id="ind-method" v-model="formulario.category_method">
                <option v-for="m in METODOS" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="campo">
              <label for="ind-clases">Número de clases</label>
              <input
                id="ind-clases"
                v-model.number="formulario.field_category"
                type="number"
                min="2"
                max="10"
              />
            </div>
          </div>
          <div class="campo m-t-2">
            <label for="ind-high-pct">% de geometrías a recuperar (top values)</label>
            <input
              id="ind-high-pct"
              v-model.number="formulario.high_values_percentage"
              type="number"
              min="1"
              max="100"
            />
          </div>

          <!-- ── Opciones ── -->
          <div class="seccion-titulo m-t-4">Opciones</div>
          <div class="checks-col">
            <label class="check-inline">
              <input v-model="formulario.use_single_field" type="checkbox" />
              Usar campo único para gráfica
            </label>
            <label class="check-inline">
              <input v-model="formulario.show_general_values" type="checkbox" />
              Mostrar valores generales
            </label>
          </div>

          <p v-if="error" class="color-error m-t-2">{{ error }}</p>

          <div class="acciones-modal">
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

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checks-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.check-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.acciones-modal {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-borde, #e8e8e8);
}

.requerido {
  color: var(--color-primario-4, #991f47);
}
</style>
