<script setup>
import { categoriesNamesInSpanish } from '~/utils/consulta';

const props = defineProps({
  siteId: { type: Number, required: true },
});

const emit = defineEmits(['creado', 'cerrar']);

const { data: userData } = useAuth();
const { crearIndicador, fetchDatasetsPaginados, fetchDatasetAttributes, syncDatasetAttributes } =
  useTableroApi();

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
  colors: 'azules_3',
  reverse_colors: false,
  use_single_field: true,
  is_histogram: false,
});

const CATEGORIAS_CAPAS = Object.entries(categoriesNamesInSpanish).map(([id, label]) => ({
  id,
  label,
}));

const busquedaDataset = ref('');
const categoriaFiltro = ref('');
const resultadosDataset = ref([]);
const buscandoDataset = ref(false);
const paginaDataset = ref(1);
const hayMasPaginas = ref(false);
const cargandoMas = ref(false);
const datasetSeleccionado = ref(null);
const atributosDataset = ref([]);
const cargandoAtributos = ref(false);
const errorAtributos = ref(false);
const sincronizandoAtributos = ref(false);
const errorSincronizacion = ref('');

const GEO_ATTRS = new Set(['the_geom', 'geometry', 'geom', 'wkb_geometry', 'shape']);

let busquedaTimeout = null;

async function cargarDatasetsIniciales() {
  buscandoDataset.value = true;
  try {
    const token = userData.value?.accessToken;
    const data = await fetchDatasetsPaginados('', 1, token, 20, categoriaFiltro.value);
    resultadosDataset.value = data?.datasets ?? data?.results ?? [];
    paginaDataset.value = 1;
    const total = data?.total ?? data?.count ?? 0;
    hayMasPaginas.value = resultadosDataset.value.length < total;
  } catch {
    resultadosDataset.value = [];
  } finally {
    buscandoDataset.value = false;
  }
}

async function cargarMasDatasets() {
  cargandoMas.value = true;
  try {
    const token = userData.value?.accessToken;
    const siguientePag = paginaDataset.value + 1;
    const data = await fetchDatasetsPaginados(
      busquedaDataset.value,
      siguientePag,
      token,
      20,
      categoriaFiltro.value
    );
    const nuevos = data?.datasets ?? data?.results ?? [];
    resultadosDataset.value = [...resultadosDataset.value, ...nuevos];
    paginaDataset.value = siguientePag;
    const total = data?.total ?? data?.count ?? 0;
    hayMasPaginas.value = resultadosDataset.value.length < total;
  } catch {
    // silently ignore
  } finally {
    cargandoMas.value = false;
  }
}

function buscarDatasets() {
  paginaDataset.value = 1;
  if (busquedaTimeout) clearTimeout(busquedaTimeout);
  busquedaTimeout = setTimeout(async () => {
    buscandoDataset.value = true;
    try {
      const token = userData.value?.accessToken;
      const data = await fetchDatasetsPaginados(
        busquedaDataset.value,
        1,
        token,
        20,
        categoriaFiltro.value
      );
      resultadosDataset.value = data?.datasets ?? data?.results ?? [];
      const total = data?.total ?? data?.count ?? 0;
      hayMasPaginas.value = resultadosDataset.value.length < total;
    } catch {
      resultadosDataset.value = [];
    } finally {
      buscandoDataset.value = false;
    }
  }, 350);
}

watch(categoriaFiltro, () => {
  busquedaDataset.value = '';
  cargarDatasetsIniciales();
});

async function cargarAtributos(pk) {
  cargandoAtributos.value = true;
  errorAtributos.value = false;
  try {
    const data = await fetchDatasetAttributes(pk);
    const attrs = data?.dataset?.attribute_set ?? data?.attribute_set ?? [];
    atributosDataset.value = attrs.filter((a) => !GEO_ATTRS.has(a.attribute));
  } catch {
    errorAtributos.value = true;
    atributosDataset.value = [];
  } finally {
    cargandoAtributos.value = false;
  }
}

function seleccionarDataset(ds) {
  datasetSeleccionado.value = ds;
  formulario.layer = ds.pk;
  formulario.name = formulario.name || ds.title;
  resultadosDataset.value = [];
  busquedaDataset.value = '';
  atributosDataset.value = [];
  cargarAtributos(ds.pk);
}

function limpiarDataset() {
  datasetSeleccionado.value = null;
  formulario.layer = '';
  formulario.layer_id_field = '';
  formulario.field_one = '';
  formulario.field_two = '';
  atributosDataset.value = [];
  errorSincronizacion.value = '';
}

async function sincronizarAtributos() {
  if (!datasetSeleccionado.value) return;
  sincronizandoAtributos.value = true;
  errorSincronizacion.value = '';
  try {
    const data = await syncDatasetAttributes(
      datasetSeleccionado.value.pk,
      userData.value?.accessToken
    );
    if (data?.attributes?.length) {
      atributosDataset.value = data.attributes.filter((a) => !GEO_ATTRS.has(a.attribute));
    } else if (data?.error === 'wfs_no_disponible') {
      errorSincronizacion.value =
        'El servicio WFS remoto no está disponible en este momento. ' +
        'Inténtalo más tarde o contacta al administrador del recurso.';
    } else {
      errorSincronizacion.value =
        data?.detail || 'No se encontraron atributos en el servicio remoto para esta capa.';
    }
  } catch {
    errorSincronizacion.value =
      'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';
  } finally {
    sincronizandoAtributos.value = false;
  }
}

async function guardar() {
  error.value = '';
  guardando.value = true;
  try {
    const colorsValue = formulario.reverse_colors ? `${formulario.colors}_r` : formulario.colors;
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
      colors: colorsValue,
      use_single_field: formulario.use_single_field,
      is_histogram: formulario.is_histogram,
      stack_order: 1,
    };
    const data = await crearIndicador(payload, userData.value?.accessToken);
    if (data?.id) {
      emit('creado', data);
      modal.value?.cerrar();
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

watch(
  () => modal.value,
  (m) => {
    if (m) m.abrir();
  },
  { once: true }
);

onMounted(async () => {
  await cargarDatasetsIniciales();
});
</script>

<template>
  <ClientOnly>
    <TablerosAdminModalBase ref="modal" ancho="960px" @cerrar="emit('cerrar')">
      <template #encabezado>
        <h2>Nuevo indicador</h2>
        <ol class="pasos-mini" aria-label="Pasos">
          <li :class="{ activo: paso >= 1, actual: paso === 1 }">1. Datos y capa</li>
          <li :class="{ activo: paso >= 2, actual: paso === 2 }">2. Tematización</li>
          <li :class="{ activo: paso >= 3, actual: paso === 3 }">3. Confirmar</li>
        </ol>
      </template>

      <template #cuerpo>
        <form @submit.prevent="siguiente">
          <!-- ── Paso 1: Datos del indicador y capa ── -->
          <div v-show="paso === 1">
            <div class="seccion-titulo">Información general</div>
            <div class="form-grid-2">
              <div class="campo">
                <label for="ind-name">Nombre del indicador <span class="requerido">*</span></label>
                <input id="ind-name" v-model="formulario.name" type="text" required />
              </div>
              <div class="campo">
                <label for="ind-info">Descripción</label>
                <input id="ind-info" v-model="formulario.info_text" type="text" />
              </div>
            </div>

            <div class="seccion-titulo m-t-3">Capa de datos</div>

            <div v-if="datasetSeleccionado" class="dataset-seleccionado">
              <div class="dataset-seleccionado__info">
                <strong>{{ datasetSeleccionado.title }}</strong>
                <span v-if="datasetSeleccionado.alternate" class="formulario-ayuda monospace">
                  {{ datasetSeleccionado.alternate }}
                </span>
              </div>
              <button
                type="button"
                class="boton boton-chico boton-secundario"
                @click="limpiarDataset"
              >
                Cambiar
              </button>
            </div>

            <div v-else>
              <div class="dataset-filtros m-b-1">
                <select v-model="categoriaFiltro" title="Filtrar por categoría">
                  <option value="">Todas las categorías</option>
                  <option v-for="cat in CATEGORIAS_CAPAS" :key="cat.id" :value="cat.id">
                    {{ cat.label }}
                  </option>
                </select>
              </div>
              <div class="dataset-buscador">
                <input
                  v-model="busquedaDataset"
                  type="text"
                  placeholder="Buscar por nombre..."
                  autocomplete="off"
                  @input="buscarDatasets"
                  @keydown.enter.prevent
                  @keydown.stop
                  @keyup.stop
                  @keypress.stop
                />
                <p v-show="buscandoDataset" class="formulario-ayuda">Cargando capas...</p>
                <ul
                  v-show="!buscandoDataset && resultadosDataset.length > 0"
                  class="dataset-resultados"
                >
                  <li
                    v-for="ds in resultadosDataset"
                    :key="ds.pk"
                    @mousedown.prevent="seleccionarDataset(ds)"
                  >
                    <span class="fw-500">{{ ds.title }}</span>
                    <span v-if="ds.alternate" class="formulario-ayuda monospace">{{
                      ds.alternate
                    }}</span>
                  </li>
                  <li
                    v-if="hayMasPaginas"
                    class="dataset-resultados__mas"
                    @mousedown.prevent="cargarMasDatasets"
                  >
                    {{ cargandoMas ? 'Cargando...' : 'Mostrar más capas...' }}
                  </li>
                </ul>
                <p
                  v-show="!buscandoDataset && resultadosDataset.length === 0"
                  class="formulario-ayuda"
                >
                  Sin resultados.
                </p>
              </div>
            </div>

            <template v-if="datasetSeleccionado">
              <p v-if="errorAtributos" class="formulario-ayuda color-error m-t-2">
                No se pudieron cargar los campos del dataset.
              </p>

              <div
                v-if="!cargandoAtributos && !errorAtributos && atributosDataset.length === 0"
                class="sin-atributos-aviso"
              >
                <p class="formulario-ayuda">
                  Este recurso no tiene atributos registrados. Puedes sincronizarlos desde el
                  servicio de origen.
                </p>
                <button
                  type="button"
                  class="boton boton-secundario boton-chico"
                  :disabled="sincronizandoAtributos"
                  @click="sincronizarAtributos"
                >
                  {{ sincronizandoAtributos ? 'Sincronizando...' : 'Sincronizar atributos' }}
                </button>
                <p v-if="errorSincronizacion" class="formulario-ayuda color-error">
                  {{ errorSincronizacion }}
                </p>
              </div>

              <div class="seccion-titulo m-t-3">Campos</div>
              <div class="form-grid-3">
                <div class="campo">
                  <label for="ind-field-id"
                    >Campo ID de geometría <span class="requerido">*</span></label
                  >
                  <select
                    id="ind-field-id"
                    v-model="formulario.layer_id_field"
                    :disabled="cargandoAtributos || !atributosDataset.length"
                    required
                  >
                    <option value="" disabled>
                      {{
                        cargandoAtributos
                          ? 'Cargando...'
                          : !atributosDataset.length
                            ? 'Sin atributos'
                            : 'Selecciona'
                      }}
                    </option>
                    <option v-for="a in atributosDataset" :key="a.attribute" :value="a.attribute">
                      {{ a.attribute }}
                    </option>
                  </select>
                </div>
                <div class="campo">
                  <label for="ind-field-one"
                    >Campo principal <span class="requerido">*</span></label
                  >
                  <select
                    id="ind-field-one"
                    v-model="formulario.field_one"
                    :disabled="cargandoAtributos || !atributosDataset.length"
                    required
                  >
                    <option value="" disabled>
                      {{
                        cargandoAtributos
                          ? 'Cargando...'
                          : !atributosDataset.length
                            ? 'Sin atributos'
                            : 'Selecciona'
                      }}
                    </option>
                    <option v-for="a in atributosDataset" :key="a.attribute" :value="a.attribute">
                      {{ a.attribute }}
                      <span v-if="a.attribute_type">({{ a.attribute_type }})</span>
                    </option>
                  </select>
                </div>
                <div class="campo">
                  <label for="ind-field-two">Campo secundario</label>
                  <select
                    id="ind-field-two"
                    v-model="formulario.field_two"
                    :disabled="cargandoAtributos || !atributosDataset.length"
                  >
                    <option value="">— ninguno —</option>
                    <option v-for="a in atributosDataset" :key="a.attribute" :value="a.attribute">
                      {{ a.attribute }}
                      <span v-if="a.attribute_type">({{ a.attribute_type }})</span>
                    </option>
                  </select>
                </div>
              </div>
            </template>
          </div>

          <!-- ── Paso 2: Tematización ── -->
          <div v-show="paso === 2">
            <div class="seccion-titulo">Clasificación</div>
            <div class="form-grid-2">
              <div class="campo">
                <label for="ind-method">Método</label>
                <select id="ind-method" v-model="formulario.category_method">
                  <option value="quantile">Cuantiles</option>
                  <option value="jenks">Jenks (natural breaks)</option>
                  <option value="equal">Intervalos iguales</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div class="campo">
                <label for="ind-categories">Número de clases</label>
                <input
                  id="ind-categories"
                  v-model.number="formulario.field_category"
                  type="number"
                  min="2"
                  max="10"
                />
              </div>
            </div>

            <div class="seccion-titulo m-t-3">Visualización</div>
            <div class="form-grid-2">
              <div class="campo">
                <label for="ind-colors">Rampa de color</label>
                <select id="ind-colors" v-model="formulario.colors">
                  <option value="azules_3">Azules</option>
                  <option value="cafes">Cafés</option>
                  <option value="morados">Morados</option>
                  <option value="verdes_2">Verdes</option>
                  <option value="naranjas">Naranjas</option>
                  <option value="rosas">Rosas</option>
                  <option value="varios">Multicolor</option>
                  <option value="semaforo">Semáforo</option>
                  <option value="semaforo_3">Semáforo 3 tonos</option>
                </select>
                <label class="check-inline m-t-1">
                  <input v-model="formulario.reverse_colors" type="checkbox" />
                  Invertir paleta
                </label>
              </div>
              <div class="campo">
                <label for="ind-plot-type">Tipo de gráfica</label>
                <select id="ind-plot-type" v-model="formulario.plot_type">
                  <optgroup label="Barras">
                    <option value="bar">Barras verticales</option>
                    <option value="horizontal_bar">Barras horizontales</option>
                    <option value="histogram">Histograma</option>
                  </optgroup>
                  <optgroup label="Circular">
                    <option value="donut">Dona</option>
                    <option value="pie">Pastel (pie)</option>
                  </optgroup>
                  <optgroup label="Líneas y área">
                    <option value="line">Línea</option>
                    <option value="area">Área</option>
                  </optgroup>
                  <optgroup label="Otros">
                    <option value="scatter">Dispersión</option>
                    <option value="gauge">Gauge</option>
                    <option value="radar">Radar</option>
                    <option value="treemap">Mapa de árbol</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          <!-- ── Paso 3: Confirmar ── -->
          <div v-show="paso === 3">
            <div class="seccion-titulo">Resumen del indicador</div>
            <dl class="resumen-dl">
              <div class="resumen-dl__fila">
                <dt>Nombre</dt>
                <dd>{{ formulario.name }}</dd>
              </div>
              <div class="resumen-dl__fila">
                <dt>Capa</dt>
                <dd>{{ datasetSeleccionado?.title || formulario.layer }}</dd>
              </div>
              <div class="resumen-dl__fila">
                <dt>Campo ID</dt>
                <dd>{{ formulario.layer_id_field }}</dd>
              </div>
              <div class="resumen-dl__fila">
                <dt>Campo principal</dt>
                <dd>{{ formulario.field_one }}</dd>
              </div>
              <div v-if="formulario.field_two" class="resumen-dl__fila">
                <dt>Campo secundario</dt>
                <dd>{{ formulario.field_two }}</dd>
              </div>
              <div class="resumen-dl__fila">
                <dt>Método</dt>
                <dd>{{ formulario.category_method }}</dd>
              </div>
              <div class="resumen-dl__fila">
                <dt>Clases</dt>
                <dd>{{ formulario.field_category }}</dd>
              </div>
              <div class="resumen-dl__fila">
                <dt>Colores</dt>
                <dd>
                  {{ formulario.colors }}{{ formulario.reverse_colors ? ' (invertida)' : '' }}
                </dd>
              </div>
              <div class="resumen-dl__fila">
                <dt>Gráfica</dt>
                <dd>{{ formulario.plot_type }}</dd>
              </div>
            </dl>
            <p class="formulario-ayuda m-t-2">
              Los datos de gráfica y mapa se podrán reconstruir desde la edición del indicador.
            </p>
          </div>

          <p v-if="error" class="color-error m-t-2">{{ error }}</p>

          <div class="acciones-modal">
            <div class="acciones-modal__izq">
              <button
                v-if="paso > 1"
                type="button"
                class="boton boton-secundario"
                @click="anterior"
              >
                ← Atrás
              </button>
              <button type="button" class="boton boton-secundario" @click="emit('cerrar')">
                Cancelar
              </button>
            </div>
            <input
              type="submit"
              class="boton boton-primario"
              :value="paso < 3 ? 'Siguiente →' : guardando ? 'Guardando...' : 'Crear indicador'"
              :disabled="guardando"
            />
          </div>
        </form>
      </template>
    </TablerosAdminModalBase>
  </ClientOnly>
</template>

<style lang="scss" scoped>
/* Indicador de pasos */
.pasos-mini {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;

  li {
    font-size: 0.78rem;
    padding: 2px 12px;
    border-radius: 12px;
    color: var(--color-texto-secundario, #999);
    white-space: nowrap;

    &.activo {
      color: var(--color-secundario-8, #5f3e47);
    }
    &.actual {
      background: var(--color-secundario-3, #f8e1e8);
      color: var(--color-primario-4, #991f47);
      font-weight: 600;
    }
  }
}

/* Secciones */
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

/* Grillas */
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  font-size: 0.85rem;
  cursor: pointer;
}

/* Dataset */
.dataset-seleccionado {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 8px 12px;
  border: 1px solid var(--color-borde, #ccc);
  border-radius: 6px;
  background: var(--color-secundario-2, #fcf3f5);
  margin-bottom: 0.5rem;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.dataset-filtros {
  select {
    width: 100%;
  }
}

.dataset-buscador {
  position: relative;
  input {
    width: 100%;
  }
}

.dataset-resultados {
  position: absolute;
  z-index: 100;
  left: 0;
  right: 0;
  top: calc(100% + 2px);
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  border: 1px solid var(--color-borde, #ccc);
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  max-height: 200px;
  overflow-y: auto;

  li {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.9rem;

    &:hover {
      background: var(--color-secundario-2, #fcf3f5);
    }
  }

  &__mas {
    justify-content: center;
    align-items: center;
    font-size: 0.82rem;
    color: var(--color-primario-4, #991f47);
    font-weight: 600;
    border-top: 1px solid var(--color-borde, #eee);
    cursor: pointer;

    &:hover {
      background: var(--color-fondo-2, #f5f5f5) !important;
    }
  }
}

.sin-atributos-aviso {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 10px 12px;
  border: 1px dashed var(--color-borde, #ccc);
  border-radius: 6px;
  background: var(--color-fondo-2, #f5f5f5);
  margin-top: 0.75rem;
}

/* Resumen */
.resumen-dl {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-borde, #e0e0e0);
  border-radius: 6px;
  overflow: hidden;

  &__fila {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 0;
    border-bottom: 1px solid var(--color-borde, #e8e8e8);

    &:last-child {
      border-bottom: none;
    }

    dt {
      padding: 7px 12px;
      background: var(--color-fondo-2, #f5f5f5);
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--color-texto-secundario, #666);
    }

    dd {
      padding: 7px 12px;
      margin: 0;
      font-size: 0.9rem;
    }
  }
}

/* Acciones */
.acciones-modal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-borde, #e8e8e8);

  &__izq {
    display: flex;
    gap: 0.5rem;
  }
}

.requerido {
  color: var(--color-primario-4, #991f47);
}
.fw-500 {
  font-weight: 500;
}
.monospace {
  font-family: monospace;
  font-size: 0.78rem;
}
</style>
