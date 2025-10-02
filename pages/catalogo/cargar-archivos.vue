<script setup>
const storeCatalogo = useCatalogoStore();

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: { class: '' },
});

const statusOk = ref(false);
const archivosEnCarga = ref([]);
const { data } = useAuth();

const base_files = ['.geojson', 'gpkg', '.zip', '.csv'];
const docs_files = ['.txt', '.pdf', '.xls', '.xlsx'];

async function guardarArchivo(files) {
  const token = ref(data.value?.accessToken);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Agregar inmediatamente el archivo a la lista con estado pendiente
    const archivo = reactive({
      nombre: file?.name,
      estatus: 'pendiente',
      mensaje: 'Cargando...',
    });
    archivosEnCarga.value.push(archivo);

    try {
      let response;
      let json;
      if (base_files.some((end) => file?.name.endsWith(end))) {
        const formData = new FormData();
        formData.append('base_file', file);
        formData.append('token', token.value);

        response = await fetch('/api/cargar-base-file', {
          method: 'POST',
          body: formData,
        });
      } else if (docs_files.some((end) => file?.name.endsWith(end))) {
        const formData = new FormData();
        formData.append('doc_file', file);
        formData.append('token', token.value);

        response = await fetch('/api/cargar-doc-file', {
          method: 'POST',
          body: formData,
        });
      } else {
        archivo.estatus = 'error_carga';
        archivo.mensaje = 'Formato no soportado';
        continue;
      }

      // Intentar parsear JSON
      try {
        json = await response.json();
      } catch (e) {
        json = null;
        console.error(e);
      }
      console.log(response);
      // Evaluar respuesta
      if (!response.ok) {
        archivo.estatus = 'error_carga';
        archivo.mensaje = `Error HTTP: ${response.status}`;
      } else if (json && json.success === false) {
        // Caso: llegó a GeoNode pero no se almacenó... puede aplicar en zips que no sean shpfiles u otros
        archivo.estatus = 'error_carga';
        archivo.mensaje = `El archivo se subió pero no se almacenó: ${json.errors?.join(', ') || 'error de importación'}`;
      } else {
        archivo.estatus = 'carga_finalizada';
        archivo.mensaje = 'Archivo cargado correctamente';
        statusOk.value = true;
      }
    } catch (error) {
      archivo.estatus = 'error_carga';
      archivo.mensaje = 'Error de red';
      console.error(error);
    }
  }
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
          <p>
            <b>Solo archivos GeoJSON, Geopaquetes, CSV, XML, PDF, JPG y PNG.</b>
          </p>

          <ClientOnly>
            <CatalogoElementoDragNdDrop
              ref="dragNdDrop"
              @pasar-archivo="(i) => guardarArchivo(i)"
            />
          </ClientOnly>
          <h2>Cargas</h2>

          <div v-for="(archivo, i) in archivosEnCarga" :key="i">
            <div
              class="p-3 borde-redondeado-16 m-y-3"
              :class="{
                'fondo-color-confirmacion': archivo.estatus == 'carga_finalizada',
                'fondo-color-error': archivo.estatus == 'error_carga',
                'fondo-color-neutro': archivo.estatus == 'pendiente',
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
                  <b> {{ archivo.mensaje }} </b>
                </div>

                <p>{{ archivo.nombre }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
