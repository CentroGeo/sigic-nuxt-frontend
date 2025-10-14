<script setup>
const { data } = useAuth();

const route = useRoute();
const selectedPk = route.query.data;
const resourceType = route.query.type;

const subidaExitosa = ref(false);
const nombreSLD = ref('');

const storeCatalogo = useCatalogoStore();
// Recuperamos la información completa del recurso
const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(resourceType);
const resourceToEdit = computed(() =>
  storeFetched.byResourceType(resourceType).find(({ pk }) => pk === selectedPk)
);

//
const dragNdDrop = ref(null);
const style_files = ['.sld'];
async function guardarArchivo(files) {
  // solo uno o el primer archivo
  if (style_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    const formData = new FormData();
    // solo el primer elemento del arreglo
    nombreSLD.value = files[0].name;
    formData.append('base_file', files[0]);
    formData.append('dataset_title', resourceToEdit.value.alternate);
    formData.append('token', data.value?.accessToken);

    const response = await $fetch('/api/subirSLD', {
      method: 'POST',
      body: formData,
    });
    console.warn('response', response);
    subidaExitosa.value = true;
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
}
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-y-3">
        <div class="alineacion-izquierda ancho-lectura">
          <div class="flex">
            <nuxt-link to="/catalogo/mis-archivos" aria-label="regresar a mis archivos">
              <span
                class="pictograma-flecha-izquierda pictograma-mediano texto-color-acento"
                aria-hidden="true"
              />
              <span class="h5 texto-color-primario p-l-2">Editar</span>
            </nuxt-link>
          </div>

          <div class="flex">
            <div class="columna-16">
              <h2 class="m-b-0">{{ resourceToEdit?.title }}</h2>

              <CatalogoMenuMisArchivos
                :recurso="resourceToEdit"
                :opciones="[
                  { texto: 'Metadatos', ruta: '/catalogo/mis-archivos/editar/MetadatosBasicos' },
                  {
                    texto: 'Estilo',
                    ruta: '/catalogo/mis-archivos/editar/estilo',
                  },
                  {
                    texto: 'Clave Geoestadística',
                    ruta: '/catalogo/mis-archivos/unir-vectores',
                  },
                ]"
              />

              <h2 class="m-t-0">Estilo</h2>
              <p><b>Estilo, solo archivos .sld</b></p>

              <!-- Drag & Drop -->
              <ClientOnly>
                <CatalogoElementoDragNdDrop
                  ref="dragNdDrop"
                  @pasar-archivo="(i) => guardarArchivo(i)"
                />
              </ClientOnly>
            </div>

            <div class="columna-16">
              <div v-if="subidaExitosa">
                <h2>Cargas recientes</h2>
                <div class="fondo-color-confirmacion p-3 borde-redondeado-16">
                  <div class="flex texto-color-confirmacion">
                    <span class="pictograma-aprobado" />
                    <b> Archivo cargado correctamente </b>
                  </div>

                  <p>{{ nombreSLD }}</p>

                  <div>
                    <nuxt-link to="/catalogo/mis-archivos">Ver en mis archivos</nuxt-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
