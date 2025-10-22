<script setup>
import { convertirBytes } from '~/utils/catalogo';

import { useAuth, useRuntimeConfig } from '#imports';
import { useCatalogoStore } from '@/stores/catalogo';
import { reactive, ref } from 'vue';

const storeCatalogo = useCatalogoStore();
const configEnv = useRuntimeConfig();
const statusOk = ref(false);
const archivosEnCarga = ref([]);
const { data } = useAuth();
const { gnoxyFetch } = useGnoxyUrl();

const base_files = ['.geojson', '.gpkg', '.zip', '.csv'];
const docs_files = ['.txt', '.pdf', '.xls', '.xlsx'];

async function guardarArchivo(files) {
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
    })
  );

  archivosEnCarga.value.push(...nuevosArchivos);

  nuevosArchivos.forEach(async (archivo, idx) => {
    const file = files[idx];
    let endpoint = null;

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
        archivo.IdRutaArchivo = result.url.split('/').slice(-1)[0];
        statusOk.value = true;
        const request_geonode = await gnoxyFetch(
          `${configEnv.public.geonodeUrl}/api/v2/datasets/${archivo.IdRutaArchivo}`
        );
        const res_geonode = await request_geonode.json();

        const request_geoserver = await gnoxyFetch(
          `${configEnv.public.geoserverUrl}/ows?service=WFS&version=1.1.0&request=GetFeature&typeName=${res_geonode.dataset.alternate}&resultType=hits`
        );
        const proyeccion = res_geonode?.dataset?.srid;
        const res_geoserver = await request_geoserver.text();
        const match = res_geoserver.match(/numberOfFeatures="(\d+)"/);
        archivo.numero_geometrias = match ? parseInt(match[1], 10) : null;
        archivo.proyeccion = proyeccion;
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
          <p><b>Solo archivos GeoJSON, Geopaquetes, CSV, XML, PDF, JPG y PNG.</b></p>

          <ClientOnly>
            <CatalogoElementoDragNdDrop @pasar-archivo="(i) => guardarArchivo(i)" />
          </ClientOnly>

          <h2>Cargas</h2>

          <div v-for="(archivo, i) in archivosEnCarga" :key="i" class="tarjetitas-carga">
            <div
              class="p-b-3 p-x-3 borde-redondeado-16 m-y-3"
              :class="{
                'fondo-color-confirmacion': archivo.estatus == 'carga_finalizada',
                'fondo-color-error': archivo.estatus == 'error_carga',
                'fondo-color-neutro': ['pendiente', 'procesando'].includes(archivo.estatus),
              }"
            >
              <div>
                <div class="flex flex-contenido-separado">
                  <div class="flex-vertical-centrado">
                    <p>
                      <span
                        v-if="['pendiente', 'procesando'].includes(archivo.estatus)"
                        class="pictograma-de-carga-sigic"
                      >
                        <img src="/img/loader.gif" alt="cargando" class="color-invertir" />
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

                  <div v-if="archivo.numero_geometrias" class="nota">
                    Se detectaron {{ archivo.numero_geometrias }} geometrías <br />
                    Sistema de referencia {{ archivo.proyeccion }}
                  </div>

                  <div v-if="archivo.IdRutaArchivo" class="flex flex-contenido-separado">
                    <div>
                      <NuxtLink
                        :to="`/catalogo/mis-archivos/editar/MetadatosBasicos?data=${archivo.IdRutaArchivo}`"
                        target="_blank"
                        >Editar metadatos</NuxtLink
                      >
                    </div>
                    <div v-if="['geojson', 'gpkg', 'zip'].includes(archivo.extension)">
                      <NuxtLink
                        :to="`/catalogo/mis-archivos/editar/estilo?data=${archivo.IdRutaArchivo}`"
                      >
                        Agregar un estilo (.sld)</NuxtLink
                      >
                    </div>
                    <div>
                      <NuxtLink to="/catalogo/mis-archivos"> Ver en Mis archivos</NuxtLink>
                    </div>
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
