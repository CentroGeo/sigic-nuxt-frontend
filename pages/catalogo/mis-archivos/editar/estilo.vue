<script setup>
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import { useResourcesSupplements } from '~/composables/useResourcesSupplements';

definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});
const storeCatalogo = useCatalogoStore();
const storeResources = useResourcesCatalogoStore();
const { getSLDs, destroySLDs, setDefaultSLD, renameSLD, syncStylesFromGeoserver } =
  useResourcesSupplements();
const config = useRuntimeConfig();

const { data } = useAuth();
const route = useRoute();
const selectedPk = route.query.data;
const subidaExitosa = ref(undefined);
const resourceToEdit = ref(null);
const dragNdDrop = ref(null);
const style_files = ['.sld'];
const isLoadingGlobal = ref(true);
const isLoading = ref(false);
const loadedStylesStatus = ref({});
const resourcestyles = ref([]);

const modalEliminar = ref(null);
const estiloAEliminar = ref('');
const defaultStyle = ref(null);
const styleTitles = ref({});

// Estado de edición inline de nombre
const editingStyle = ref(null);
const editingTitle = ref('');

// Estado de sincronización
const syncResult = ref(null);
const isSyncing = ref(false);

async function recargarEstilos() {
  const styles = await getSLDs(resourceToEdit.value);
  resourcestyles.value = styles.styleList;
  defaultStyle.value = styles.defaultStyle;
  styleTitles.value = styles.styleTitles || {};
}

async function guardarArchivo(files) {
  loadedStylesStatus.value = {};
  subidaExitosa.value = undefined;
  isLoading.value = true;

  const validFileList = {};
  for (const file of files) {
    const isValid = style_files.map((end) => file.name.endsWith(end)).includes(true);
    validFileList[file.name] = isValid;
  }

  if (!Object.values(validFileList).includes(false)) {
    for (const d of files) {
      loadedStylesStatus.value[d.name] = 'loading';
    }
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
      loadedStylesStatus.value[fileName] = fileUpdateStatus;
      await recargarEstilos();
    }
  } else {
    dragNdDrop.value?.archivoNoValido();
  }
  isLoading.value = false;
}

function abrirConfirmacionBorrar(style) {
  estiloAEliminar.value = style;
  modalEliminar.value?.abrirModal();
}

async function confirmarBorrarEstilo() {
  isLoading.value = true;
  const exito = await destroySLDs({
    pk: selectedPk,
    stylename: estiloAEliminar.value,
    sourcetype: resourceToEdit.value.sourcetype,
    token: data.value?.accessToken,
  });

  if (exito) {
    await recargarEstilos();
  }
  modalEliminar.value?.cerrarModal();
  isLoading.value = false;
}

async function establecerPredeterminado(style) {
  isLoading.value = true;
  const exito = await setDefaultSLD({
    pk: selectedPk,
    stylename: style,
    token: data.value?.accessToken,
  });
  if (exito) {
    await recargarEstilos();
  }
  isLoading.value = false;
}

function iniciarEdicion(style) {
  editingStyle.value = style;
  editingTitle.value = styleTitles.value[style] || style;
}

function cancelarEdicion() {
  editingStyle.value = null;
  editingTitle.value = '';
}

async function guardarNombreEstilo(style) {
  if (!editingTitle.value.trim()) return;
  isLoading.value = true;
  const exito = await renameSLD({
    pk: selectedPk,
    stylename: style,
    newTitle: editingTitle.value.trim(),
    token: data.value?.accessToken,
  });
  if (exito) {
    await recargarEstilos();
  }
  editingStyle.value = null;
  editingTitle.value = '';
  isLoading.value = false;
}

async function sincronizarDesdeGeoServer() {
  isSyncing.value = true;
  syncResult.value = null;
  const resultado = await syncStylesFromGeoserver({
    pk: selectedPk,
    token: data.value?.accessToken,
  });
  syncResult.value = resultado;
  if (resultado) {
    await recargarEstilos();
  }
  isSyncing.value = false;
}

onMounted(async () => {
  resourceToEdit.value = await storeResources.fetchResourceByPk(selectedPk);
  await recargarEstilos();
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
          <img
            class="color-invertir"
            :src="`${config.app.baseURL}img/loader.gif`"
            alt="...Cargando"
            height="120px"
          />
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

              <h2 class="m-t-0">Estilos de la capa</h2>
              <div class="m-b-5">
                <table class="tabla-condensada">
                  <thead>
                    <tr>
                      <th>Nombre del estilo</th>
                      <th class="alineacion-derecha">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="style in resourcestyles" :key="style">
                      <td>
                        <!-- Modo edición inline -->
                        <div
                          v-if="editingStyle === style"
                          class="flex"
                          style="gap: 0.5rem; align-items: center"
                        >
                          <input
                            v-model="editingTitle"
                            type="text"
                            class="campo-texto"
                            style="flex: 1"
                            @keyup.enter="guardarNombreEstilo(style)"
                            @keyup.escape="cancelarEdicion"
                          />
                          <button
                            type="button"
                            class="boton-pictograma boton-sin-contenedor-primario"
                            aria-label="Guardar nombre"
                            @click="guardarNombreEstilo(style)"
                          >
                            <span class="pictograma-aprobado" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            class="boton-pictograma boton-sin-contenedor-secundario"
                            aria-label="Cancelar edición"
                            @click="cancelarEdicion"
                          >
                            <span class="pictograma-cerrar" aria-hidden="true" />
                          </button>
                        </div>
                        <!-- Modo lectura -->
                        <span v-else>
                          {{ styleTitles[style] || style }}
                          <span
                            v-if="style === defaultStyle"
                            class="texto-color-acento"
                            style="font-size: 0.85em; margin-left: 0.4rem"
                            >(predeterminado)</span
                          >
                        </span>
                      </td>
                      <td class="alineacion-derecha">
                        <template v-if="editingStyle !== style">
                          <!-- Editar nombre -->
                          <button
                            type="button"
                            class="boton-pictograma boton-sin-contenedor-secundario"
                            aria-label="Editar nombre del estilo"
                            @click="iniciarEdicion(style)"
                          >
                            <span class="pictograma-editar" aria-hidden="true" />
                          </button>
                          <!-- Establecer como predeterminado -->
                          <button
                            v-if="style !== defaultStyle"
                            type="button"
                            class="boton-pictograma boton-sin-contenedor-secundario"
                            aria-label="Establecer como predeterminado"
                            :title="
                              'Establecer \'' +
                              (styleTitles[style] || style) +
                              '\' como predeterminado'
                            "
                            @click="establecerPredeterminado(style)"
                          >
                            <span class="pictograma-estrella" aria-hidden="true" />
                          </button>
                          <!-- Eliminar (solo no-default) -->
                          <button
                            v-if="style !== defaultStyle"
                            type="button"
                            class="boton-pictograma boton-sin-contenedor-secundario"
                            aria-label="Eliminar estilo"
                            @click="abrirConfirmacionBorrar(style)"
                          >
                            <span class="pictograma-eliminar" aria-hidden="true" />
                          </button>
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Sincronizar desde GeoServer -->
              <div class="m-b-4">
                <button
                  type="button"
                  class="boton-secundario"
                  :disabled="isSyncing"
                  @click="sincronizarDesdeGeoServer"
                >
                  <span v-if="isSyncing">Sincronizando...</span>
                  <span v-else>Sincronizar estilos desde GeoServer</span>
                </button>
                <div
                  v-if="syncResult !== null"
                  class="fondo-color-confirmacion texto-color-confirmacion p-2 borde-redondeado-16 m-t-2"
                  style="display: inline-block; margin-left: 0.5rem"
                >
                  {{ syncResult.synced }} sincronizados, {{ syncResult.already_registered }} ya
                  registrados
                  <span v-if="syncResult.errors?.length">
                    · {{ syncResult.errors.length }} errores
                  </span>
                </div>
              </div>

              <p><b style="font-weight: bold">Agregar estilos, solo archivos .sld</b></p>

              <!-- Drag & Drop -->
              <ClientOnly>
                <CatalogoElementoDragNdDrop
                  ref="dragNdDrop"
                  @pasar-archivo="(i) => guardarArchivo(i)"
                />
              </ClientOnly>
            </div>

            <div class="columna-16">
              <div v-if="Object.keys(loadedStylesStatus).length > 0">
                <h2>Cargas recientes</h2>
                <div v-for="file in Object.keys(loadedStylesStatus)" :key="file">
                  <!--Cargando-->
                  <div
                    v-if="loadedStylesStatus[file] === 'loading'"
                    class="fondo-color-neutro p-3 borde-redondeado-16 m-y-2"
                  >
                    <img
                      class="color-invertir"
                      :src="`${config.app.baseURL}img/loader.gif`"
                      height="30"
                    />
                    <b> Subiendo {{ file }}... </b>
                  </div>

                  <!--Subida exitosa-->
                  <div
                    v-else-if="loadedStylesStatus[file] === 'finished'"
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

      <ClientOnly>
        <SisdaiModal ref="modalEliminar">
          <template #encabezado>
            <h2 class="m-t-0">¿Deseas eliminar este estilo?</h2>
          </template>
          <template #cuerpo>
            <p>
              El estilo <b>{{ styleTitles[estiloAEliminar] || estiloAEliminar }}</b> será eliminado
              permanentemente del servidor.
            </p>
            <div class="flex flex-contenido-final m-t-5">
              <button
                type="button"
                class="boton-secundario m-r-2"
                @click="modalEliminar?.cerrarModal()"
              >
                Cancelar
              </button>
              <button type="button" class="boton-primario" @click="confirmarBorrarEstilo">
                Eliminar
              </button>
            </div>
          </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>
