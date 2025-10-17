<script setup>
const storeCatalogo = useCatalogoStore();
const storeResources = useResourcesCatalogoStore();
const { data } = useAuth();
const route = useRoute();
const selectedPk = route.query.data;
//const resourceType = route.query.type;
const subidaExitosa = ref(undefined);
const nombreSLD = ref('');
const resourceToEdit = await storeResources.fetchResourceByPk(selectedPk);
const user = data.value?.user.email || 'Sin sesion';
const dragNdDrop = ref(null);
const style_files = ['.sld'];
const isLoading = ref(false);
// Recuperamos la información completa del recurso
/* const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(resourceType);
const resourceToEdit = computed(() =>
  storeFetched.byResourceType(resourceType).find(({ pk }) => pk === selectedPk)
); */

async function guardarArchivo(files) {
  // solo uno o el primer archivo
  subidaExitosa.value = undefined;
  isLoading.value = true;
  if (style_files.map((end) => files[0]?.name.endsWith(end)).includes(true)) {
    const formData = new FormData();
    // solo el primer elemento del arreglo
    nombreSLD.value = files[0].name;
    formData.append('base_file', files[0]);
    formData.append('dataset_title', resourceToEdit.alternate);
    formData.append('token', data.value?.accessToken);

    const response = await $fetch('/api/subirSLD', {
      method: 'POST',
      body: formData,
    });
    //console.warn('response', response);
    if (response === 'finished') {
      subidaExitosa.value = true;
    } else {
      subidaExitosa.value = false;
    }
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
  isLoading.value = true;
}
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main v-if="!resourceToEdit || resourceToEdit === 'Error'">
        <div
          class="contenedor ancho-lectura borde-redondeado-16 texto-color-error fondo-color-error p-3 m-3 flex flex-contenido-centrado"
        >
          <span class="pictograma-alerta" />
          <b> Hubo un error en el servidor o el archivo no existe</b>
        </div>
      </main>
      <main v-else-if="!user || user !== resourceToEdit?.owner.username">
        <div
          class="contenedor ancho-lectura borde-redondeado-16 texto-color-error fondo-color-error p-3 m-3 flex flex-contenido-centrado"
        >
          <span class="pictograma-alerta" />
          <b> No tienes permisos para ver esta página.</b>
        </div>
      </main>
      <main v-else id="principal" class="contenedor m-b-10 m-y-3">
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
