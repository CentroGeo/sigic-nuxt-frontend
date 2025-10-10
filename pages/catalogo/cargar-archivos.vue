<script setup>
import { useAuth, useRuntimeConfig } from '#imports';
import { useCatalogoStore } from '@/stores/catalogo';
import { reactive, ref } from 'vue';

const storeCatalogo = useCatalogoStore();
const configEnv = useRuntimeConfig();
const statusOk = ref(false);
const archivosEnCarga = ref([]);
const { data } = useAuth();

const base_files = ['.geojson', 'gpkg', '.zip', '.csv'];
const docs_files = ['.txt', '.pdf', '.xls', '.xlsx'];

async function guardarArchivo(files) {
  const token = ref(data.value?.accessToken);

  // 1️⃣ Agregamos todos los archivos a la lista como pendientes
  const nuevosArchivos = Array.from(files).map((file) =>
    reactive({
      nombre: file.name,
      estatus: 'pendiente',
      mensaje: 'Preparando carga...',
      porcentaje: 0,
      rutaArchivo: null,
    })
  );

  archivosEnCarga.value.push(...nuevosArchivos);

  // 2️⃣ Procesamos cada archivo en paralelo
  nuevosArchivos.forEach(async (archivo, idx) => {
    const file = files[idx];
    let endpoint = null;

    // Identificar tipo de archivo y establecer endpoint
    if (base_files.some((end) => file.name.endsWith(end))) {
      endpoint = '/api/cargar-base-file';
    } else if (docs_files.some((end) => file.name.endsWith(end))) {
      endpoint = '/api/cargar-doc-file';
    } else {
      archivo.estatus = 'error_carga';
      archivo.mensaje = 'Formato no soportado';
      return;
    }

    try {
      // 3️⃣ Crear FormData para enviar al endpoint del servidor
      const formData = new FormData();
      if (base_files.some((end) => file.name.endsWith(end))) {
        formData.append('base_file', file);
      } else {
        formData.append('doc_file', file);
      }
      formData.append('token', token.value);

      // 4️⃣ Enviar archivo al endpoint server-side
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      // Monitorear porcentaje (opcional, aproximado)
      archivo.porcentaje = 100;

      const result = await response.json();

      // 5️⃣ Evaluar respuesta
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
        archivo.estatus = 'carga_finalizada';
        archivo.mensaje = 'Archivo cargado correctamente';
        archivo.rutaArchivo = result.url;
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

// 🕒 Polling para monitorear la importación de capas base
async function monitorLayerImport(executionId, archivo) {
  const token = ref(data.value?.accessToken);
  const startTime = Date.now();
  const interval = setInterval(async () => {
    try {
      const res = await fetch(
        `${configEnv.public.geonodeUrl}/api/v2/executionrequest/${executionId}`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        }
      );
      const data = await res.json();

      if (data.status === 'SUCCESS') {
        clearInterval(interval);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        archivo.estatus = 'carga_finalizada';
        archivo.mensaje = `Procesado en ${elapsed}s`;
        archivo.rutaArchivo = data.imported_resources?.[0]?.detail_url || null;
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
          <p><b>Solo archivos GeoJSON, Geopaquetes, CSV, XML, PDF, JPG y PNG.</b></p>

          <ClientOnly>
            <CatalogoElementoDragNdDrop @pasar-archivo="(i) => guardarArchivo(i)" />
          </ClientOnly>

          <h2>Cargas</h2>

          <div v-for="(archivo, i) in archivosEnCarga" :key="i" class="tarjetitas-carga">
            <div
              class="p-3 borde-redondeado-16 m-y-3"
              :class="{
                'fondo-color-confirmacion': archivo.estatus == 'carga_finalizada',
                'fondo-color-error': archivo.estatus == 'error_carga',
                'fondo-color-neutro': ['pendiente', 'procesando'].includes(archivo.estatus),
              }"
            >
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

                <p>{{ archivo.nombre }}</p>
                <div
                  v-if="['pendiente', 'procesando'].includes(archivo.estatus)"
                  class="barra-progreso"
                >
                  <div class="progreso" :style="{ width: `${archivo.porcentaje}%` }">
                    {{ archivo.porcentaje }}%
                  </div>
                </div>

                <p v-if="archivo.rutaArchivo">
                  <a :href="archivo.rutaArchivo" target="_blank">{{ archivo.rutaArchivo }}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss">
div.tarjetitas-carga {
  div.barra-progreso {
    background: var(--color-neutro-2);
    div.progreso {
      background: var(--color-primario-1);
      height: 4px;
      border-radius: 4px;
    }
  }
}
</style>
