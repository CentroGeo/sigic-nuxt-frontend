<script setup>
import { useAuth, useRuntimeConfig } from '#imports';
import { useCatalogoStore } from '@/stores/catalogo';
import { reactive, ref } from 'vue';
import { convertirBytes } from '~/utils/catalogo';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});

const storeCatalogo = useCatalogoStore();
const configEnv = useRuntimeConfig();
const statusOk = ref(false);
const archivosEnCarga = ref([]);
const hayCargas = ref(false);
const { data } = useAuth();
const { gnoxyFetch } = useGnoxyUrl();
const { uploadFile, pollJob, importToGeonode } = useDataImporter();

const base_files = ['.geojson', '.gpkg'];
const docs_files = ['.txt', '.pdf'];
const FORMATOS_TABULARES = ['csv', 'xlsx', 'xls', 'json'];

async function guardarArchivo(files) {
  archivosEnCarga.value = [];
  hayCargas.value = true;
  const token = ref(data.value?.accessToken);

  const nuevosArchivos = Array.from(files).map((file) =>
    reactive({
      nombre: file.name,
      extension: file.name.split('.').slice(-1)[0],
      tamanio: convertirBytes(file.size),
      estatus: 'pendiente',
      mensaje: 'Preparando carga...',
      IdRutaArchivo: null,
      numero_geometrias: null,
      proyeccion: null,
      tipo_recurso: null,
      jobId: null,
      jobSchema: null,
      geoCapabilidad: null,
    })
  );

  archivosEnCarga.value.push(...nuevosArchivos);

  nuevosArchivos.forEach(async (archivo, idx) => {
    const file = files[idx];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // Flujo SIGIC para tabulares
    if (FORMATOS_TABULARES.includes(ext)) {
      archivo.estatus = 'analizando_tabular';
      archivo.mensaje = 'Analizando columnas del archivo…';
      try {
        const importJob = await uploadFile(file, data.value?.accessToken);
        archivo.jobId = importJob.id;
        await esperarAnalisis(archivo);
        archivo.geoCapabilidad = calcularGeoCapabilidad(archivo.jobSchema);
        archivo.estatus = 'decision_tabular';
        archivo.mensaje = '';
      } catch {
        archivo.estatus = 'error_carga';
        archivo.mensaje = 'Error al analizar el archivo.';
      }
      return;
    }

    let endpoint = null;

    if (base_files.some((end) => file.name.endsWith(end))) {
      endpoint = `${configEnv.app.baseURL}api/cargar-base-file`;
    } else if (docs_files.some((end) => file.name.endsWith(end))) {
      endpoint = `${configEnv.app.baseURL}api/cargar-doc-file`;
    } else {
      archivo.estatus = 'error_carga';
      archivo.mensaje = 'Formato no soportado';
      return;
    }

    try {
      const formData = new FormData();
      if (base_files.some((end) => file.name.endsWith(end))) {
        formData.append('base_file', file);
      } else {
        formData.append('doc_file', file);
      }
      formData.append('token', token.value);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      // Evaluar respuesta
      if (!result.success) {
        archivo.estatus = 'error_carga';
        archivo.mensaje = result.message || 'Error en procesamiento';
      } else if (result.execution_id) {
        // Caso: capa base, procesando en GeoNode
        archivo.estatus = 'procesando';
        archivo.mensaje = 'Procesando capa en GeoNode...';
        monitorLayerImport(result.execution_id, archivo);
      } else if (result.url) {
        // Caso: documento cargado
        archivo.IdRutaArchivo = result.url.split('/').slice(-1)[0];
        // Se recupera la información necesaria para cada tipo de archivo
        let tipo;
        if (base_files.includes('.' + file.name.split('.').slice(-1)[0])) {
          const request_geonode = await gnoxyFetch(
            `${configEnv.public.geonodeUrl}/api/v2/datasets/${archivo.IdRutaArchivo}`
          );
          const res_geonode = await request_geonode.json();
          tipo = isGeometricExtension(res_geonode.dataset.extent) ? 'dataLayer' : 'dataTable';
          if (tipo === 'dataLayer') {
            archivo.tipo_recurso = tipo;
            const request_geoserver = await gnoxyFetch(
              `${configEnv.public.geonodeUrl}/gs/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=${res_geonode.dataset.alternate}&resultType=hits`
            );
            const proyeccion = res_geonode?.dataset?.srid;
            const res_geoserver = await request_geoserver.text();
            const match = res_geoserver.match(/numberOfFeatures="(\d+)"/);
            archivo.numero_geometrias = match ? parseInt(match[1], 10) : null;
            archivo.proyeccion = proyeccion;
          } else if (tipo === 'dataTable') {
            archivo.tipo_recurso = tipo;
          }
        } else {
          tipo = 'document';
          archivo.tipo_recurso = tipo;
        }
        // Se actualizan las banderas de carga
        archivo.estatus = 'carga_finalizada';
        archivo.mensaje = 'Archivo cargado correctamente';
        statusOk.value = true;
      } else {
        archivo.estatus = 'error_carga';
        archivo.mensaje = 'Respuesta inesperada del servidor';
      }
    } catch (error) {
      archivo.estatus = 'error_carga';
      archivo.mensaje = 'Error de red';
      console.error(error);
    }
  });
}

// Polling para análisis SIGIC de tabulares
async function esperarAnalisis(archivo) {
  for (let i = 0; i < 48; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const jobData = await pollJob(archivo.jobId, data.value?.accessToken);
    if (jobData.status === 'ready') {
      archivo.jobSchema = jobData.column_schema;
      return;
    }
    if (jobData.status === 'error') throw new Error(jobData.error_message || 'Error analizando');
  }
  throw new Error('Tiempo de análisis agotado');
}

function calcularGeoCapabilidad(schema) {
  if (!schema) return null;
  const roles = schema.map((c) => c.geo_role).filter(Boolean);
  if (roles.includes('lat') && roles.includes('lon')) return 'Columnas de coordenadas detectadas';
  if (roles.some((r) => ['mun_key', 'state_key'].includes(r))) return 'Claves INEGI detectadas';
  if (roles.some((r) => ['mun_name', 'state_name'].includes(r)))
    return 'Nombres geográficos detectados';
  return null;
}

function irAImportador(archivo) {
  navigateTo(`/geocontenidos/importar-datos?job=${archivo.jobId}`);
}

async function subirComoTabular(archivo) {
  archivo.estatus = 'procesando';
  archivo.mensaje = 'Importando datos a GeoNode…';
  try {
    await importToGeonode(archivo.jobId, data.value?.accessToken);
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const jobData = await pollJob(archivo.jobId, data.value?.accessToken);
      if (jobData.status === 'done') {
        archivo.estatus = 'carga_finalizada';
        archivo.mensaje = 'Archivo cargado correctamente como tabla.';
        statusOk.value = true;
        return;
      }
      if (jobData.status === 'error') throw new Error(jobData.error_message || 'Error importando');
    }
    throw new Error('El procesamiento está tardando más de lo esperado.');
  } catch (e) {
    archivo.estatus = 'error_carga';
    archivo.mensaje = e.message || 'Error al importar.';
  }
}

// Polling para monitorear la importación de capas base
async function monitorLayerImport(executionId, archivo) {
  //const token = ref(data.value?.accessToken);
  const startTime = Date.now();
  const interval = setInterval(async () => {
    try {
      const res = await gnoxyFetch(
        `${configEnv.public.geonodeUrl}/api/v2/executionrequest/${executionId}`
      );
      const data = await res.json();

      if (data.status === 'SUCCESS') {
        clearInterval(interval);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        archivo.estatus = 'carga_finalizada';
        archivo.mensaje = `Procesado en ${elapsed}s`;
        archivo.IdRutaArchivo = data.imported_resources?.[0]?.detail_url.split('/').slice(-1)[0];
      }

      if (data.status === 'FAILED') {
        clearInterval(interval);
        archivo.estatus = 'error_carga';
        archivo.mensaje = 'Error al procesar en GeoNode';
      }
    } catch (e) {
      console.error('Error consultando ejecución:', e);
    }
  }, 2000);
}
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10">
        <div class="alineacion-izquierda ancho-lectura">
          <h2>Carga archivo</h2>
          <p class="m-y-1">
            <b>Formatos admitidos: GeoJSON, GeoPackage, CSV, XLSX, XLS, JSON, PDF y TXT.</b>
          </p>
          <p
            class="texto-color-informacion fondo-color-informacion borde borde-color-informacion borde-redondeado-2 p-2 m-y-2"
          >
            Los archivos tabulares (CSV, Excel, JSON) se analizan automáticamente para detectar
            columnas geográficas, lo que permite la espacialización de datos tabulares mediante la
            construcción de geometrías de puntos.
          </p>
          <!-- Si el archivo contiene datos de coordenadas pero estos no siguen la
            nomenclatura establecida, serán procesados como cualquier otro valor numérico sin
            interpretación geoespacial.-->
          <ClientOnly>
            <CatalogoElementoDragNdDrop @pasar-archivo="(i) => guardarArchivo(i)" />
          </ClientOnly>

          <h2 v-if="hayCargas">Cargas</h2>

          <div v-for="(archivo, i) in archivosEnCarga" :key="i" class="tarjetitas-carga">
            <div
              class="p-b-3 p-x-3 borde-redondeado-16 m-y-3"
              :class="{
                'fondo-color-confirmacion': archivo.estatus == 'carga_finalizada',
                'fondo-color-error': archivo.estatus == 'error_carga',
                'fondo-color-neutro': [
                  'pendiente',
                  'procesando',
                  'analizando_tabular',
                  'decision_tabular',
                ].includes(archivo.estatus),
              }"
            >
              <div>
                <div class="flex flex-contenido-separado">
                  <div class="flex-vertical-centrado">
                    <p>
                      <span
                        v-if="
                          ['pendiente', 'procesando', 'analizando_tabular'].includes(
                            archivo.estatus
                          )
                        "
                        class="pictograma-de-carga-sigic"
                      >
                        <img
                          :src="`${configEnv.app.baseURL}img/loader.gif`"
                          alt="cargando"
                          class="color-invertir"
                        />
                      </span>
                      {{ archivo.nombre }}
                    </p>
                  </div>
                  <div class="flex">
                    <p class="borde borde-redondeado-8" style="padding: 4px">
                      .{{ archivo.extension }}
                    </p>
                    <p class="flex flex-vertical-centrado">
                      {{ archivo.tamanio }}
                    </p>
                  </div>
                </div>
                <div
                  :class="{
                    'texto-color-confirmacion': archivo.estatus == 'carga_finalizada',
                    'texto-color-error': archivo.estatus == 'error_carga',
                  }"
                >
                  <div class="flex">
                    <span
                      :class="{
                        'pictograma-aprobado': archivo.estatus == 'carga_finalizada',
                        'pictograma-alerta': archivo.estatus == 'error_carga',
                      }"
                    />
                    <b>{{ archivo.mensaje }}</b>
                  </div>

                  <!-- Decisión para archivos tabulares -->
                  <div v-if="archivo.estatus === 'decision_tabular'" class="decision-tabular m-t-2">
                    <p class="m-b-1">
                      <strong>Archivo tabular detectado.</strong> ¿Cómo deseas subirlo?
                    </p>
                    <p
                      v-if="archivo.geoCapabilidad"
                      class="texto-chico texto-color-confirmacion m-b-2"
                    >
                      ✓ {{ archivo.geoCapabilidad }}
                    </p>
                    <div class="decision-botones">
                      <button class="boton-primario boton-chico" @click="irAImportador(archivo)">
                        Georreferenciar y crear geocontenido →
                      </button>
                      <button
                        class="boton-secundario boton-chico"
                        @click="subirComoTabular(archivo)"
                      >
                        Subir como datos tabulares
                      </button>
                    </div>
                  </div>

                  <div
                    v-if="archivo.numero_geometrias && archivo.estatus === 'carga_finalizada'"
                    class="nota"
                  >
                    Se detectaron {{ archivo.numero_geometrias }} geometrías <br />
                    Sistema de referencia {{ archivo.proyeccion }}
                  </div>

                  <div
                    v-if="archivo.IdRutaArchivo && archivo.estatus === 'carga_finalizada'"
                    class="flex flex-contenido-inicio"
                  >
                    <div class="m-x-2 m-y-1">
                      <NuxtLink
                        :to="`/catalogo/mis-recursos/editar/MetadatosBasicos?data=${archivo.IdRutaArchivo}&type=${archivo.tipo_recurso}`"
                        target="_blank"
                        >Editar metadatos</NuxtLink
                      >
                    </div>
                    <div v-if="archivo.tipo_recurso === 'dataLayer'" class="m-x-2 m-y-1">
                      <NuxtLink
                        :to="`/catalogo/mis-recursos/editar/estilo?data=${archivo.IdRutaArchivo}&type=dataLayer`"
                      >
                        Agregar un estilo (.sld)</NuxtLink
                      >
                    </div>
                    <!-- <div>
                      <NuxtLink to="/catalogo/mis-recursos/metadatos-pendientes">
                        Ver en Mis recursos</NuxtLink
                      >
                    </div> -->
                  </div>
                </div>
              </div>
              <div v-if="archivo.estatus == 'carga_finalizada'" class=""></div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss">
.decision-tabular {
  padding: 12px 0 4px;

  .decision-botones {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
}

span.pictograma-de-carga-sigic {
  display: inline-flex;
  vertical-align: middle;
  padding: 0.25em;
  img {
    height: 16px;
    position: relative;
  }
}
</style>
