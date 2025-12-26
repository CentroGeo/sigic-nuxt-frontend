<script setup>
//import { getSLDs, wait } from '~/utils/consulta';
import { getSLDs } from '~/utils/consulta';

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
const resourceToEdit = ref(null);
const dragNdDrop = ref(null);
const style_files = ['.sld'];
const isLoadingGlobal = ref(true);
const isLoading = ref(false);
const loadedStylesSatus = ref({});
const resourcestyles = ref([]);

// Función que usa el nuevo endpoint
async function guardarArchivo(files) {
  subidaExitosa.value = undefined;
  isLoading.value = true;

  const validFileList = {};
  // Primero revisamos si los archivos son válidos
  files.forEach((file) => {
    const isValid = style_files.map((end) => file.name.endsWith(end)).includes(true);
    validFileList[file.name] = isValid;
  });

  // Si los archivos son válidos, agregamos los sld
  if (!Object.values(validFileList).includes(false)) {
    files.forEach((d) => {
      loadedStylesSatus.value[d.name] = 'loading';
    });

    for (const d of files) {
      const fileName = d.name;
      const formData = new FormData();
      formData.append('base_file', d);
      formData.append('token', data.value?.accessToken);
      formData.append('pk', selectedPk);
      const fileUpdateStatus = await $fetch('/api/subirSLDMultiple', {
        method: 'POST',
        body: formData,
      });
      loadedStylesSatus.value[fileName] = fileUpdateStatus;
      const styles = await getSLDs(resourceToEdit.value);
      resourcestyles.value = styles.styleList;
    }
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
  isLoading.value = false;
}

onMounted(async () => {
  resourceToEdit.value = await storeResources.fetchResourceByPk(selectedPk);
  const styles = await getSLDs(resourceToEdit.value);
  resourcestyles.value = styles.styleList;
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
              <h2 class="m-t-0">Estilo</h2>

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

              <div>
                <table class="tabla-condensada">
                  <thead>
                    <tr>
                      <th>Estilos de la capa</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="style in resourcestyles" :key="style">
                      <td>{{ style }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p><b>Agregar estilos. Solo archivos .sld</b></p>

              <!-- Drag & Drop -->
              <ClientOnly>
                <CatalogoElementoDragNdDrop
                  ref="dragNdDrop"
                  @pasar-archivo="(i) => guardarArchivo(i)"
                />
              </ClientOnly>
            </div>

            <div class="columna-16">
              <div v-if="Object.keys(loadedStylesSatus).length > 0">
                <h2>Cargas recientes</h2>
                <div v-for="file in Object.keys(loadedStylesSatus)" :key="file">
                  <!--Cargando-->
                  <div
                    v-if="loadedStylesSatus[file] === 'loading'"
                    class="fondo-color-neutro p-3 borde-redondeado-16 m-y-2"
                  >
                    <img class="color-invertir" src="/img/loader.gif" height="30" />
                    <b> Subiendo {{ file }}... </b>
                  </div>

                  <!--Subida exitosa-->
                  <div
                    v-else-if="loadedStylesSatus[file] === 'finished'"
                    class="fondo-color-confirmacion p-3 borde-redondeado-16 m-y-2"
                  >
                    <div class="flex texto-color-confirmacion">
                      <span class="pictograma-aprobado" />
                      <b> Archivo cargado correctamente </b>
                    </div>
                    <p>{{ file }}</p>
                    <div>
                      <nuxt-link to="/catalogo/mis-archivos">Ver en mis archivos</nuxt-link>
                    </div>
                  </div>

                  <!--Subida fracasó-->
                  <div
                    v-else
                    class="fondo-color-error texto-color-error p-3 borde-redondeado-16 m-y-2"
                  >
                    <div class="flex texto-color-error">
                      <span class="pictograma-alerta" />
                      <b> No se logró cargar el archivo adecuadamente. Inténtalo de nuevo </b>
                    </div>
                    <p>{{ file }}</p>
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
