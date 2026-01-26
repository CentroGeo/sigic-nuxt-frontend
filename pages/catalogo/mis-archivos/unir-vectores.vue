<script setup>
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiColapsableNavegacion from '@centrogeomx/sisdai-componentes/src/componentes/colapsable-navegacion/SisdaiColapsableNavegacion.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import { fetchByPk } from '~/utils/catalogo';
import { getWMSserver, hasWFS } from '~/utils/consulta';

const { data } = useAuth();
const token = data.value?.accessToken;
// const userEmail = data.value?.user.email;

const route = useRoute();
const selectedPk = route.query.data;
// const type = route.query.type;

const storeCatalogo = useCatalogoStore();
const storeCatalogoResources = useResourcesCatalogoStore();

const editedResource = ref(undefined);

const titleEditedResource = ref('');

const seleccionCampoCapa = ref('');
const variables = ref([]);

storeCatalogoResources.getMyTotalResources('dataLayer');
storeCatalogoResources.getMyResourcesByType('dataLayer');
const layerTotals = computed(() => storeCatalogoResources.myTotalsByType['dataLayer']);
const seleccionCapaGeo = ref('');
const layerResources = computed(() => storeCatalogoResources.myResourcesByType['dataLayer']);

const seleccionCampoObjetivo = ref('');
const varGeoLayer = ref([]);
const dict = ref({});

const unionExitosa = ref(false);
const validarCampos = ref(false);

const modalUnionVectorial = ref(null);
const masTiempo = ref(false);

const obtenerVariables = async (resource) => {
  const config = useRuntimeConfig();
  const proxy = `${config.public.geonodeUrl}/proxy/?url=`;
  let url = '';
  if (!resource || resource.sourcetype !== 'REMOTE') {
    url = new URL(`${config.public.geonodeUrl}/gs/ows`);
  } else if (resource.sourcetype === 'REMOTE') {
    const wmsStatus = await hasWFS(resource, 'table');
    if (wmsStatus) {
      const link = getWMSserver(resource);
      url = new URL(link);
    }
  }
  url.search = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName: resource.alternate,
    outputFormat: 'application/json',
  }).toString();

  let res;
  if (resource.sourcetype === 'REMOTE') {
    res = await fetch(proxy + `${encodeURIComponent(url)}`);
  } else if (!token) {
    res = await fetch(url);
  } else if (token) {
    res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const datas = await res.json();
  const atributos = datas.features.map((f) => f.properties);
  return Object.keys(atributos[0] || {});
};

function limpiarCamposAUnir() {
  dict.value = Object.fromEntries(variables.value.map((d) => [d, false]));
}

// TODO: unir vectores con el backend
async function unirCampos() {
  modalUnionVectorial.value.abrirModal();
  setTimeout(() => {
    masTiempo.value = true;
  }, 2000);
  // armar columnas
  const columns = ref([]);
  Object.keys(dict.value).forEach((key) => {
    if (dict.value[key] === true) {
      columns.value.push(key);
    }
  });

  // body: validar que esos campos se puedan unir
  console.warn('body', {
    columns: columns.value,
    geo_layer: seleccionCapaGeo.value,
    geo_pivot: seleccionCampoObjetivo.value,
    layer: editedResource.value.pk,
    layer_pivot: seleccionCampoCapa.value,
    // token: data.value?.accessToken,
  });
  // TODO: abrir modal de carga
  // store.unionVectorialPendiente = true
  // await $fetch('/api/join', {
  //   method: 'POST',
  //   body: {
  //     layer: editedResource.value.pk,
  //     geo_layer: seleccionCapaGeo.value,
  //     layer_pivot: seleccionCampoCapa.value,
  //     geo_pivot: seleccionCampoObjetivo.value,
  //     columns: columns.value,
  //     token: data.value?.accessToken,
  //   },
  // });
  unionExitosa.value = true;
}

// para habilitar o deshabilitar el botón de unir campos
watch([seleccionCampoCapa, seleccionCapaGeo, seleccionCampoObjetivo], ([n1, n2, n3]) => {
  // Si en los tres se ha seleccionado algo, habilita el botón
  if (!n1.trim() <= 0 && n2.trim() >= 1 && !n3.trim() <= 0) {
    validarCampos.value = false;
  } else {
    validarCampos.value = true;
  }
});

watch(seleccionCapaGeo, (nv) => {
  (async () => {
    const filterPkResourcesCapas = layerResources.value.filter((resource) => resource.pk === nv)[0];
    // Tiene que estar publicada la capa geográfica
    varGeoLayer.value = await obtenerVariables(filterPkResourcesCapas);
  })();
});

onMounted(async () => {
  editedResource.value = await fetchByPk(selectedPk);
  titleEditedResource.value = editedResource.value.title;
  variables.value = await obtenerVariables(editedResource.value);
  dict.value = Object.fromEntries(variables.value.map((d) => [d, false]));
});

// const resourceToEdit = computed(() =>
//   storeFetched.byResourceType(type).find(({ pk }) => pk === selectedPk)
// );
// const resourcesCapas = computed(
//   () =>
//     storeFetched
//       .byResourceType(resourceTypeDic.dataLayer)
//       .filter((resource) => resource.owner.email === userEmail) || {}
// );
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>

    <template #visualizador>
      <main id="principal" class="contenedor m-b-10 m-y-4">
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

          <CatalogoMenuMisArchivos
            :recurso="editedResource"
            :opciones="[
              { texto: 'Metadatos', ruta: '/catalogo/mis-archivos/editar/MetadatosBasicos' },
              {
                texto: 'Clave Geoestadística',
                ruta: '/catalogo/mis-archivos/unir-vectores',
              },
            ]"
          />

          <p>
            Agrega a tus datos tabulados un campo geoespacial. Esto permitirá convertirlo en un
            archivo de capa geográfica (.shp, .geojson, entre otros), haciéndolo compatible con el
            visor de mapas y otras herramientas de análisis espacial dentro de SIGIC.
          </p>

          <div class="m-t-3">
            <p v-if="titleEditedResource === ''">...cargando</p>
            <div v-else class="flex">
              <div class="columna-16">
                <h3>{{ titleEditedResource }}</h3>

                <ClientOnly>
                  <SisdaiSelector
                    v-model="seleccionCampoCapa"
                    class="m-b-2"
                    etiqueta="Tipo de Clave Geoestadística"
                  >
                    <option v-for="value in variables" :key="value" :value="value">
                      {{ value }}
                    </option>
                  </SisdaiSelector>

                  <p v-if="layerTotals === 0">...cargando capas</p>
                  <!--Se desea incorporar paginación en el selector ?-->
                  <SisdaiSelector
                    v-if="layerTotals > 0"
                    v-model="seleccionCapaGeo"
                    etiqueta="Capa objetivo"
                    texto_ayuda="Capa a la que se agregarán las nuevas columnas"
                  >
                    <option v-for="value in layerResources" :key="value.pk" :value="value.pk">
                      {{ value.title }}
                    </option>
                  </SisdaiSelector>

                  <p v-if="seleccionCapaGeo.trim() >= 1 && varGeoLayer.length === 0">
                    ...cargando campos
                  </p>
                  <SisdaiSelector
                    v-if="varGeoLayer.length > 0"
                    v-model="seleccionCampoObjetivo"
                    etiqueta="Campo objetivo"
                    texto_ayuda="Campo o columna que se utilizará para hacer la unión vectorial"
                  >
                    <option v-for="value in varGeoLayer" :key="value" :value="value">
                      {{ value }}
                    </option>
                  </SisdaiSelector>

                  <label for="idcolapnavcamposunidos">Campos a unir</label>
                  <SisdaiColapsableNavegacion :colapsado="false">
                    <template #encabezado> Selecciona las opciones que requieres </template>
                    <template #contenido>
                      <div class="columns columns-2">
                        <div>
                          <div v-for="(value, key, index) in dict" :key="index" class="">
                            <ClientOnly>
                              <SisdaiCasillaVerificacion
                                v-model="dict[key]"
                                name="idcolapnavcamposunidos"
                                :etiqueta="key"
                              />
                            </ClientOnly>
                          </div>

                          <button
                            class="boton-chico opcion-checkbox boton-secundario"
                            aria-label="Limpiar selección"
                            type="button"
                            @click="limpiarCamposAUnir"
                          >
                            Limpiar selección
                          </button>
                        </div>
                      </div>
                    </template>
                  </SisdaiColapsableNavegacion>
                  <p aria-live="polite" class="formulario-ayuda" role="status">
                    Elige los campos que quieres unir
                  </p>
                </ClientOnly>
              </div>

              <div class="columna-16">
                <div v-if="!unionExitosa" class="flex">
                  <nuxt-link
                    class="boton-secundario boton-chico"
                    type="button"
                    to="/catalogo/mis-archivos"
                    >Ir a mis archivos
                  </nuxt-link>
                  <button
                    class="boton-primario boton-chico"
                    :disabled="validarCampos"
                    @click="unirCampos"
                  >
                    Unir campo
                  </button>
                </div>

                <div v-if="unionExitosa" class="flex">
                  <nuxt-link
                    class="boton-secundario boton-chico"
                    type="button"
                    to="/catalogo/mis-archivos"
                    >Ver en mis archivos
                  </nuxt-link>
                  <nuxt-link class="boton boton-primario boton-chico" to="/consulta/capas"
                    >Ver capa en Visualizador
                  </nuxt-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ClientOnly>
        <SisdaiModal ref="modalUnionVectorial">
          <template #encabezado>
            <h1 class="m-t-0 texto-tamanio-6">Procesando</h1>
            <p v-if="masTiempo">
              Esto puede tardar más de lo esperado. Puedes seguir navegando con la interfaz mientras
              se completa.
            </p>
          </template>
          <template #cuerpo>
            <div class="flex flex-contenido-centrado">
              <figure>
                <img src="/img/loader.gif" alt="Loader de SIGIC" />
                <figcaption class="texto-centrado">Uniendo capa</figcaption>
              </figure>
            </div>
            <div class="flex flex-contenido-separado m-t-3 p-1">
              <div class="columna-8">
                <button
                  type="button"
                  class="boton-secundario"
                  value="cancela"
                  @click="modalUnionVectorial.cerrarModal()"
                >
                  Cancelar
                </button>
              </div>
              <div class="columna-8">
                <nuxt-link class="boton boton-primario" to="/catalogo/mis-archivos"
                  >Ir a mis archivos
                </nuxt-link>
              </div>
            </div>
          </template>
          <template #pie> </template>
        </SisdaiModal>
      </ClientOnly>
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss">
.modal-cuerpo {
  // margin-top: 32px !important;
  .flex {
    .boton-secundario,
    .boton-primario {
      width: 100%;
      display: inherit;
    }
  }
}
.colapsable {
  border: 1px solid var(--borde);
  border-radius: 8px;
  padding: 2px;
  .colapsable-boton {
    background-color: var(--fondo);
    color: var(--color);
  }
}
.colapsable.abierto {
  .colapsable-contenedor {
    padding: 8px;
  }
}
</style>
