<script setup>
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});
const storeCatalogo = useCatalogoStore();
const storeResources = useResourcesCatalogoStore();
const { data } = useAuth();
const route = useRoute();
const selectedPk = route.query.data;
//const resourceType = route.query.type;
const subidaExitosa = ref(undefined);
const nombreSLD = ref('');
const resourceToEdit = ref(null);
//const user = data.value?.user.email || 'Sin sesion';
const dragNdDrop = ref(null);
const style_files = ['.sld'];
const isLoadingGlobal = ref(true);
const isLoading = ref(false);

async function guardarArchivo(files) {
  // solo uno o el primer archivo
  subidaExitosa.value = undefined;
  isLoading.value = true;
  if (style_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    const formData = new FormData();
    // solo el primer elemento del arreglo
    nombreSLD.value = files[0].name;
    formData.append('base_file', files[0]);
    //formData.append('dataset_title', resourceToEdit.value.alternate);
    formData.append('token', data.value?.accessToken);
    formData.append('pk', selectedPk);

    const response = await $fetch('/api/subirSLDMultiple', {
      method: 'POST',
      body: formData,
    });
    console.warn('response', response);
    if (response === 'finished') {
      subidaExitosa.value = true;
    } else {
      subidaExitosa.value = false;
    }
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
  subidaExitosa.value = true;
  isLoading.value = true;
}

onMounted(async () => {
  resourceToEdit.value = await storeResources.fetchResourceByPk(selectedPk);
  isLoadingGlobal.value = false;
});
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="isLoadingGlobal">
        <div class="flex flex-contenido-centrado m-t-3">
          <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="120px" />
        </div>
      </main>
      <main v-else id="principal" class="contenedor m-b-10 m-y-3">
        <div v-if="resourceToEdit === 'Error'">
          <div
            class="contenedor ancho-lectura borde-redondeado-16 texto-color-error fondo-color-error p-3 m-3 flex flex-contenido-centrado"
          >
            <span class="pictograma-alerta" />
            <b> Hubo un error en el servidor o el archivo no existe</b>
          </div>
        </div>
        <div v-else class="alineacion-izquierda ancho-lectura">
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
              <div v-if="isLoading">
                <div class="borde-redondeado-16 flex fondo-color-neutro p-3">
                  <img src="/img/loader.gif" height="30" /> <b> Cargando Archivo </b>
                </div>
              </div>
              <!--Subida exitosa-->
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
              <!--Subida fracasó-->
              <div v-if="subidaExitosa === false">
                <div class="borde-redondeado-16 flex texto-color-error fondo-color-error p-3">
                  <span class="pictograma-alerta" />
                  <b> No se logró cargar el archivo adecuadamente. Inténtalo de nuevo </b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
