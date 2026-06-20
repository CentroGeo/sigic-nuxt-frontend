<script setup>
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const { data: session } = useAuth();
const token = computed(() => session.value?.accessToken);
const {
  uploadFile,
  pollJob,
  updateSchema,
  previewGeo,
  importToGeonode,
  finalizeLayer,
  createTablero,
  listJobs,
  deleteJob,
  fetchCategories,
} = useDataImporter();

// --- Estado del wizard ---
const paso = ref(1);
const cargando = ref(false);
const mensajeCarga = ref('');
const error = ref('');

// Paso 1
const job = ref(null);
let pollingTimer = null;

// Paso 2 — esquema editable
const schema = ref([]);
const geoStrategy = ref('none');
const geoFieldLat = ref('');
const geoFieldLon = ref('');
const geoFieldJoin = ref('');

// Paso 3 — preview geo
const previewResult = ref(null);
const loadingPreview = ref(false);

// Paso 4 — metadatos + estilos + geocontenido
const categorias = ref([]);
const metaNombre = ref('');
const metaDescripcion = ref('');
const metaKeywords = ref('');
const metaLicencia = ref('');
const metaCategoria = ref('');
const metaAtribucion = ref('');
const styleSpecs = ref([]);
const defaultStyleCol = ref('');

const GEOCONTENIDOS = [
  {
    id: 'tablero',
    label: 'Tablero de datos',
    descripcion: 'Indicadores con mapas, gráficas y tarjetas de resumen',
    pictograma: 'pictograma-mapa-generador',
    disponible: true,
  },
  {
    id: 'capa',
    label: 'Solo la capa',
    descripcion: 'Publica la capa en el catálogo sin crear un geocontenido adicional',
    pictograma: 'pictograma-archivo-subir',
    disponible: true,
  },
  {
    id: 'geohistoria',
    label: 'Geo-historia',
    descripcion: 'Presentación narrativa con escenas y capas de mapa',
    pictograma: 'pictograma-proyectos',
    disponible: false,
  },
  {
    id: 'panorama',
    label: 'Panorama',
    descripcion: 'Vista general comparativa de indicadores territoriales',
    pictograma: 'pictograma-consulta',
    disponible: false,
  },
  {
    id: 'micrositio',
    label: 'Micrositio',
    descripcion: 'Página temática con mapas embebidos',
    pictograma: 'pictograma-archivo-subir',
    disponible: false,
  },
];

const tipoGeocont = ref('tablero');
const siteIdCreado = ref(null);
const datasetCreado = ref(null); // { dataset_id, alternate } para el caso 'capa'

// ------------------------------------------------------------------
// Paso 1: Subir archivo
// ------------------------------------------------------------------
async function onArchivo(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!['csv', 'xlsx', 'xls', 'json'].includes(ext)) {
    error.value = 'Formato no soportado. Use CSV, Excel (.xlsx/.xls) o JSON.';
    return;
  }
  error.value = '';
  cargando.value = true;
  mensajeCarga.value = 'Subiendo archivo…';
  try {
    job.value = await uploadFile(file, token.value);
    metaNombre.value = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
    mensajeCarga.value = 'Analizando columnas del archivo…';
    iniciarPolling();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al subir el archivo.';
    cargando.value = false;
  }
}

function iniciarPolling() {
  if (pollingTimer) clearInterval(pollingTimer);
  pollingTimer = setInterval(async () => {
    if (!job.value) return;
    try {
      const actualizado = await pollJob(job.value.id, token.value);
      job.value = actualizado;
      if (actualizado.status === 'ready') {
        clearInterval(pollingTimer);
        cargando.value = false;
        schema.value = actualizado.column_schema ?? [];
        geoStrategy.value = actualizado.geo_strategy;
        geoFieldLat.value = actualizado.geo_field_lat;
        geoFieldLon.value = actualizado.geo_field_lon;
        geoFieldJoin.value = actualizado.geo_field_join;
        paso.value = 2;
      } else if (actualizado.status === 'error') {
        clearInterval(pollingTimer);
        cargando.value = false;
        error.value = actualizado.error_message || 'Error analizando el archivo.';
      }
    } catch {
      // seguir esperando
    }
  }, 2500);
}

// ------------------------------------------------------------------
// Paso 2 → 3: Guardar esquema y avanzar
// ------------------------------------------------------------------
async function guardarEsquema() {
  if (!job.value) return;
  cargando.value = true;
  mensajeCarga.value = 'Guardando configuración…';
  error.value = '';
  try {
    await updateSchema(
      job.value.id,
      {
        column_schema: schema.value,
        geo_strategy: geoStrategy.value,
        geo_field_lat: geoFieldLat.value,
        geo_field_lon: geoFieldLon.value,
        geo_field_join: geoFieldJoin.value,
      },
      token.value
    );
    await cargarPreview();
    paso.value = 3;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error guardando esquema.';
  } finally {
    cargando.value = false;
  }
}

// ------------------------------------------------------------------
// Paso 3: Preview geográfico
// ------------------------------------------------------------------
async function cargarPreview() {
  if (!job.value || geoStrategy.value === 'none') return;
  loadingPreview.value = true;
  previewResult.value = null;
  try {
    const result = await previewGeo(
      job.value.id,
      {
        geo_strategy: geoStrategy.value,
        geo_field_lat: geoFieldLat.value,
        geo_field_lon: geoFieldLon.value,
        geo_field_join: geoFieldJoin.value,
      },
      token.value
    );
    previewResult.value = result;
  } catch {
    previewResult.value = { ok: false, error: 'No se pudo cargar el preview.' };
  } finally {
    loadingPreview.value = false;
  }
}

// ------------------------------------------------------------------
// Paso 3 → 4: Procesar e importar datos
// ------------------------------------------------------------------
async function importar() {
  if (!job.value) return;
  cargando.value = true;
  mensajeCarga.value = 'Procesando datos…';
  error.value = '';
  try {
    await importToGeonode(job.value.id, token.value);
    await esperarImportacion();
    // Cargar categorías en paralelo al avanzar a paso 4
    fetchCategories(token.value).then((cats) => (categorias.value = cats));
    paso.value = 4;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error importando.';
  } finally {
    cargando.value = false;
  }
}

async function esperarImportacion() {
  if (!job.value) return;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const actualizado = await pollJob(job.value.id, token.value);
    job.value = actualizado;
    if (actualizado.status === 'done') return;
    if (actualizado.status === 'error')
      throw new Error(actualizado.error_message || 'Error en importacion');
  }
  throw new Error('El procesamiento está tardando más de lo esperado. Intenta de nuevo.');
}

// ------------------------------------------------------------------
// Paso 4: Crear geocontenido
// ------------------------------------------------------------------
async function esperarTablero() {
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 4000));
    const actualizado = await pollJob(job.value.id, token.value);
    job.value = actualizado;
    if (actualizado.dashboard_site_id) {
      siteIdCreado.value = actualizado.dashboard_site_id;
      return;
    }
    if (actualizado.error_message?.startsWith('Error creando tablero:')) {
      throw new Error(actualizado.error_message);
    }
  }
  throw new Error('La generación del tablero está tardando más de lo esperado. Intenta de nuevo.');
}

async function crearGeocont() {
  if (!job.value) return;
  error.value = '';

  if (tipoGeocont.value === 'capa') {
    if (!metaNombre.value.trim()) {
      error.value = 'El nombre de la capa es requerido.';
      return;
    }
    if (!metaDescripcion.value.trim()) {
      error.value = 'El resumen / descripción es requerido.';
      return;
    }
    if (!metaCategoria.value) {
      error.value = 'La categoría temática es requerida.';
      return;
    }
    if (!metaLicencia.value) {
      error.value = 'La licencia es requerida.';
      return;
    }
  }

  cargando.value = true;
  mensajeCarga.value = 'Creando geocontenido…';
  try {
    if (tipoGeocont.value === 'tablero') {
      const result = await createTablero(
        job.value.id,
        {
          name: metaNombre.value,
          description: metaDescripcion.value,
          layer_abstract: metaDescripcion.value,
          layer_keywords: metaKeywords.value,
          layer_license: metaLicencia.value,
          layer_category: metaCategoria.value,
          layer_attribution: metaAtribucion.value,
          style_specs: styleSpecs.value,
          default_style_col: defaultStyleCol.value || undefined,
        },
        token.value
      );
      if (result.building) {
        mensajeCarga.value = 'Construyendo tablero de datos… (puede tardar un momento)';
        await esperarTablero();
      } else if (result.site_id) {
        siteIdCreado.value = result.site_id;
      }
    } else if (tipoGeocont.value === 'capa') {
      const result = await finalizeLayer(
        job.value.id,
        {
          name: metaNombre.value,
          layer_abstract: metaDescripcion.value,
          layer_keywords: metaKeywords.value,
          layer_license: metaLicencia.value,
          layer_category: metaCategoria.value,
          layer_attribution: metaAtribucion.value,
          style_specs: styleSpecs.value,
          default_style_col: defaultStyleCol.value || undefined,
        },
        token.value
      );
      datasetCreado.value = result;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error creando geocontenido.';
  } finally {
    cargando.value = false;
  }
}

const PASOS_LABELS = ['Subir archivo', 'Revisar columnas', 'Geografía', 'Metadatos y estilos'];

async function cargarJobExistente(jobId) {
  cargando.value = true;
  mensajeCarga.value = 'Cargando job…';
  error.value = '';
  let delegaLoaderAlPolling = false;
  try {
    const existingJob = await pollJob(jobId, token.value);
    job.value = existingJob;
    schema.value = existingJob.column_schema || [];
    geoStrategy.value = existingJob.geo_strategy || 'none';
    geoFieldLat.value = existingJob.geo_field_lat || '';
    geoFieldLon.value = existingJob.geo_field_lon || '';
    geoFieldJoin.value = existingJob.geo_field_join || '';
    if (existingJob.original_filename) {
      metaNombre.value = existingJob.original_filename
        .replace(/\.[^.]+$/, '')
        .replace(/[_-]/g, ' ');
    }

    switch (existingJob.status) {
      case 'done':
        if (existingJob.dashboard_site_id) {
          siteIdCreado.value = existingJob.dashboard_site_id;
          cargando.value = false;
          paso.value = 4;
        } else {
          fetchCategories(token.value).then((cats) => (categorias.value = cats));
          cargando.value = false;
          paso.value = 4;
        }
        break;
      case 'ready':
        cargando.value = false;
        paso.value = 2;
        break;
      case 'importing':
        mensajeCarga.value = 'Importando datos a GeoNode…';
        await esperarImportacion();
        fetchCategories(token.value).then((cats) => (categorias.value = cats));
        cargando.value = false;
        paso.value = 4;
        break;
      case 'analyzing':
      case 'pending':
        // iniciarPolling gestiona cargando por sí mismo al terminar
        mensajeCarga.value = 'Analizando columnas del archivo…';
        delegaLoaderAlPolling = true;
        iniciarPolling();
        break;
      case 'error':
        error.value = existingJob.error_message || 'El job terminó con un error.';
        break;
      default:
        error.value = `Estado inesperado del job: ${existingJob.status}`;
    }
  } catch (e) {
    error.value =
      e instanceof Error
        ? e.message
        : 'No se pudo cargar el job. Verifica que el enlace sea correcto.';
  } finally {
    if (!delegaLoaderAlPolling) cargando.value = false;
  }
}

// ------------------------------------------------------------------
// Jobs recientes
// ------------------------------------------------------------------
const jobsRecientes = ref([]);
const cargandoJobs = ref(false);
const eliminandoJobId = ref(null);

async function cargarJobsRecientes() {
  if (!token.value) {
    console.warn('[importar-datos] sin token, no se cargan jobs');
    return;
  }
  cargandoJobs.value = true;
  try {
    const resultado = await listJobs(token.value);
    console.debug('[importar-datos] jobs cargados:', resultado.length);
    jobsRecientes.value = resultado;
  } catch (e) {
    console.error('[importar-datos] error cargando jobs:', e);
  } finally {
    cargandoJobs.value = false;
  }
}

async function retomarJob(jobId) {
  tipoGeocont.value = 'tablero';
  jobsRecientes.value = [];
  await cargarJobExistente(jobId);
}

watch(paso, (p) => {
  if (p === 1) cargarJobsRecientes();
});

async function eliminarJob(jobId) {
  eliminandoJobId.value = jobId;
  try {
    await deleteJob(jobId, token.value);
    jobsRecientes.value = jobsRecientes.value.filter((j) => j.id !== jobId);
  } finally {
    eliminandoJobId.value = null;
  }
}

onMounted(() => {
  const jobIdParam = route.query.job;

  if (token.value) {
    if (jobIdParam) {
      tipoGeocont.value = 'capa';
      cargarJobExistente(Number(jobIdParam));
    } else {
      cargarJobsRecientes();
    }
  } else {
    const stop = watch(token, (t) => {
      if (t) {
        stop();
        if (jobIdParam) {
          tipoGeocont.value = 'capa';
          cargarJobExistente(Number(jobIdParam));
        } else {
          cargarJobsRecientes();
        }
      }
    });
  }
});

onUnmounted(() => {
  if (pollingTimer) clearInterval(pollingTimer);
});

onErrorCaptured((err) => {
  error.value = `Error al renderizar el paso: ${err instanceof Error ? err.message : String(err)}`;
  cargando.value = false;
  return false;
});
</script>

<template>
  <div class="importar-datos p-4">
    <h2 class="m-b-1">Importar datos</h2>
    <p class="texto-color-secundario m-b-4">
      Sube un archivo CSV, Excel o JSON para crear un geocontenido georreferenciado.
    </p>

    <!-- Indicador de pasos -->
    <ol class="pasos-indicador m-b-4" aria-label="Pasos del asistente">
      <li
        v-for="(label, i) in PASOS_LABELS"
        :key="i"
        class="paso-item"
        :class="{ activo: paso === i + 1, completado: paso > i + 1 }"
        :aria-current="paso === i + 1 ? 'step' : undefined"
      >
        <span class="paso-numero" aria-hidden="true">{{ i + 1 }}</span>
        <span class="paso-label">{{ label }}</span>
      </li>
    </ol>

    <!-- Error global -->
    <div v-if="error" class="alerta alerta-error m-b-3" role="alert">
      <span class="pictograma-alerta" />
      {{ error }}
    </div>

    <!-- Loader del sistema (spinner GIF) -->
    <div v-if="cargando" class="m-y-4">
      <GeocontenidosLoader :mensaje="mensajeCarga" />
    </div>

    <template v-else>
      <!-- ========== PASO 1: Subir archivo ========== -->
      <div v-if="paso === 1">
        <CatalogoElementoDragNdDrop @pasar-archivo="onArchivo" />
        <p class="texto-chico texto-color-secundario m-t-2">
          Formatos aceptados: <strong>CSV, XLSX, XLS, JSON</strong>. Tamaño máximo: 50 MB.
        </p>

        <ImportadorJobsPendientes
          :jobs="jobsRecientes"
          :cargando="cargandoJobs"
          :eliminando="eliminandoJobId"
          @retomar="retomarJob"
          @eliminar="eliminarJob"
        />
      </div>

      <!-- ========== PASO 2: Revisar esquema ========== -->
      <div v-if="paso === 2">
        <ImportadorTablaEsquema :schema="schema" @update:schema="(v) => (schema = v)" />

        <div class="flex flex-contenido-final m-t-4 brecha-2">
          <button class="boton-secundario" @click="paso = 1">Regresar</button>
          <button class="boton-primario" @click="guardarEsquema">Continuar a Geografía</button>
        </div>
      </div>

      <!-- ========== PASO 3: Configurar geografía ========== -->
      <div v-if="paso === 3">
        <ImportadorConfigGeo
          v-if="schema.length"
          :schema="schema"
          :geo-strategy="geoStrategy"
          :geo-field-lat="geoFieldLat"
          :geo-field-lon="geoFieldLon"
          :geo-field-join="geoFieldJoin"
          @update:geo-strategy="geoStrategy = $event"
          @update:geo-field-lat="geoFieldLat = $event"
          @update:geo-field-lon="geoFieldLon = $event"
          @update:geo-field-join="geoFieldJoin = $event"
        />

        <div v-if="geoStrategy !== 'none'" class="m-t-3">
          <button
            class="boton-secundario boton-chico"
            :disabled="loadingPreview"
            @click="cargarPreview"
          >
            <span v-if="loadingPreview" class="cargador cargador-chico m-r-1" />
            Verificar coincidencia geográfica
          </button>
          <div v-if="previewResult" class="m-t-2">
            <div v-if="previewResult.ok" class="alerta alerta-exito">
              <span class="pictograma-exito" />
              <template v-if="previewResult.total > previewResult.sample_size">
                Muestra verificada: {{ previewResult.matched }} de
                {{ previewResult.sample_size }} registros tienen geometría válida (muestra de
                {{ previewResult.total }} totales).
              </template>
              <template v-else>
                {{ previewResult.matched }} de {{ previewResult.total }} registros tienen geometría
                asignada.
              </template>
            </div>
            <div v-else class="alerta alerta-error">
              <span class="pictograma-alerta" />
              {{ previewResult.error || 'No se pudo calcular el preview.' }}
            </div>
          </div>
        </div>

        <div class="flex flex-contenido-final m-t-4 brecha-2">
          <button class="boton-secundario" @click="paso = 2">Regresar</button>
          <button class="boton-primario" @click="importar">
            {{ geoStrategy === 'none' ? 'Continuar sin mapa' : 'Procesar y continuar' }}
          </button>
        </div>
      </div>

      <!-- ========== PASO 4: Metadatos, estilos y geocontenido ========== -->
      <div v-if="paso === 4">
        <div v-if="!siteIdCreado && !datasetCreado">
          <!-- Metadatos de la capa -->
          <ImportadorMetadatos
            :nombre="metaNombre"
            :descripcion="metaDescripcion"
            :keywords="metaKeywords"
            :licencia="metaLicencia"
            :categoria="metaCategoria"
            :atribucion="metaAtribucion"
            :categorias="categorias"
            :requeridos="tipoGeocont === 'capa'"
            @update:nombre="metaNombre = $event"
            @update:descripcion="metaDescripcion = $event"
            @update:keywords="metaKeywords = $event"
            @update:licencia="metaLicencia = $event"
            @update:categoria="metaCategoria = $event"
            @update:atribucion="metaAtribucion = $event"
          />

          <!-- Estilos de visualización -->
          <ImportadorEstilos
            :schema="schema"
            :geo-strategy="geoStrategy"
            :specs="styleSpecs"
            :default-col="defaultStyleCol"
            @update:specs="styleSpecs = $event"
            @update:default-col="defaultStyleCol = $event"
          />

          <hr class="m-y-4" />

          <!-- Selector de tipo de geocontenido -->
          <fieldset class="m-b-4">
            <legend class="etiqueta m-b-2">¿Qué tipo de geocontenido deseas crear?</legend>
            <div class="grid columnas-2 brecha-2">
              <label
                v-for="tipo in GEOCONTENIDOS"
                :key="tipo.id"
                class="tarjeta-tipo-geocont"
                :class="{ seleccionado: tipoGeocont === tipo.id, deshabilitado: !tipo.disponible }"
              >
                <input
                  v-if="tipo.disponible"
                  v-model="tipoGeocont"
                  type="radio"
                  :value="tipo.id"
                  class="visualmente-oculto"
                />
                <span :class="`${tipo.pictograma} pictograma-mediano`" aria-hidden="true" />
                <span class="tipo-label">{{ tipo.label }}</span>
                <span class="tipo-desc texto-chico texto-color-secundario">{{
                  tipo.descripcion
                }}</span>
                <span v-if="!tipo.disponible" class="etiqueta etiqueta-neutro texto-chico"
                  >Próximamente</span
                >
              </label>
            </div>
          </fieldset>

          <div v-if="job?.geonode_dataset_id" class="alerta alerta-exito m-b-3">
            <span class="pictograma-exito" />
            Datos procesados correctamente. Ya puedes crear tu geocontenido.
          </div>

          <div class="flex flex-contenido-final m-t-2 brecha-2">
            <button class="boton-secundario" @click="paso = 3">Regresar</button>
            <button class="boton-primario" :disabled="!metaNombre" @click="crearGeocont">
              Crear {{ GEOCONTENIDOS.find((g) => g.id === tipoGeocont)?.label }}
            </button>
          </div>
        </div>

        <!-- Tablero creado exitosamente -->
        <div v-else-if="siteIdCreado" class="texto-centrado p-4">
          <span class="pictograma-exito pictograma-grande texto-color-exito" />
          <h3 class="m-t-2">¡Tablero creado!</h3>
          <p class="texto-color-secundario m-b-4">
            Tu tablero fue generado con los indicadores y estilos configurados. Puedes
            personalizarlo en el editor.
          </p>
          <NuxtLink :to="`/geocontenidos/tableros/${siteIdCreado}`" class="boton boton-primario">
            Ir al editor del tablero
          </NuxtLink>
        </div>

        <!-- Capa publicada exitosamente -->
        <div v-else-if="datasetCreado" class="texto-centrado p-4">
          <span class="pictograma-exito pictograma-grande texto-color-exito" />
          <h3 class="m-t-2">¡Capa publicada!</h3>
          <p class="texto-color-secundario m-b-4">
            La capa fue publicada en el catálogo con los metadatos y estilos configurados.
          </p>
          <NuxtLink
            :to="`/consulta/capas?capas=${datasetCreado.dataset_id}`"
            class="boton boton-primario"
          >
            Ver en el visualizador
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
// --- Indicador de pasos ---
.pasos-indicador {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0;

  .paso-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
    text-align: center;
    opacity: 0.45;

    // línea conectora entre pasos
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 14px;
      left: 50%;
      width: 100%;
      height: 2px;
      background: currentColor;
      opacity: 0.25;
      z-index: 0;
    }

    &.activo,
    &.completado {
      opacity: 1;
    }

    &.activo .paso-numero {
      background-color: var(--color-primario-4, #991f47);
      color: white;
      border-color: var(--color-primario-4, #991f47);
    }

    &.completado .paso-numero {
      background-color: var(--color-secundario-9, #53323c);
      color: white;
      border-color: var(--color-secundario-9, #53323c);
    }
  }

  .paso-numero {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid currentColor;
    background: white;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;
    margin-bottom: 6px;
  }

  .paso-label {
    font-size: 0.75rem;
    line-height: 1.2;
    max-width: 80px;
  }
}

// --- Tarjetas de tipo de geocontenido ---
.tarjeta-tipo-geocont {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  background-color: var(--color-fondo-2, #fafafa);
  transition: border-color 0.15s;

  &:hover:not(.deshabilitado) {
    border-color: var(--color-primario-4, #991f47);
  }

  &.seleccionado {
    border-color: var(--color-primario-4, #991f47);
    background-color: var(--color-secundario-2, #fcf3f5);
  }

  &.deshabilitado {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tipo-label {
    font-weight: 600;
    font-size: 0.9rem;
  }
}

.visualmente-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
