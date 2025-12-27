<script setup>
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiColapsableNavegacion from '@centrogeomx/sisdai-componentes/src/componentes/colapsable-navegacion/SisdaiColapsableNavegacion.vue';
import SisdaiModal from '@centrogeomx/sisdai-componentes/src/componentes/modal/SisdaiModal.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import { fetchByPk } from '~/utils/catalogo';
import { getWMSserver, hasWMS } from '~/utils/consulta';

const { data } = useAuth();
const token = data.value?.accessToken;

const route = useRoute();
const selectedPk = route.query.data;

const storeCatalogo = useCatalogoStore();
const storeResources = useResourcesCatalogoStore();

const editedResource = ref(undefined);

const titleEditedResource = ref('');

const seleccionCampoCapa = ref('');
const variables = ref([]);

storeResources.getMyTotalResources('dataLayer');
storeResources.getMyResourcesByType('dataLayer');

const seleccionCapaGeo = ref('');
const layerResources = computed(() => storeResources.myResourcesByType['dataLayer']);

const seleccionCampoObjetivo = ref('');
const varGeoLayer = ref([]);
const dictCamposAUnir = ref({});

const unionExitosa = ref(false);
const validarCampos = ref(true);

const modalUnionVectorial = ref(null);
const masTiempo = ref(false);

const obtenerVariables = async (resource) => {
  const config = useRuntimeConfig();
  const proxy = `${config.public.geonodeUrl}/proxy/?url=`;
  let url = '';
  if (!resource || resource.sourcetype !== 'REMOTE') {
    url = new URL(`${config.public.geonodeUrl}/gs/ows`);
  } else if (resource.sourcetype === 'REMOTE') {
    const wmsStatus = await hasWMS(resource, 'table');
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
  dictCamposAUnir.value = Object.fromEntries(variables.value.map((d) => [d, false]));
}

// TODO: unir vectores con el backend
async function unirCampos() {
  modalUnionVectorial.value.abrirModal();

  // armar columnas
  const columns = ref([]);
  Object.keys(dictCamposAUnir.value).forEach((key) => {
    if (dictCamposAUnir.value[key] === true) {
      columns.value.push(key);
    }
  });

  // body: validar que esos campos se puedan unir
  console.warn('body', {
    layer: +editedResource.value.pk,
    geo_layer: +seleccionCapaGeo.value,
    layer_pivot: seleccionCampoCapa.value,
    geo_pivot: seleccionCampoObjetivo.value,
    columns: columns.value,
  });

  try {
    const config = useRuntimeConfig();
    const response = await $fetch(`${config.public.basePath}/api/join`, {
      method: 'POST',
      headers: { token: token },
      body: {
        layer: +editedResource.value.pk, // Tabla destino (sin geometría)
        geo_layer: +seleccionCapaGeo.value, // Capa fuente (con geometría)
        layer_pivot: seleccionCampoCapa.value, // Columna llave en destino
        geo_pivot: seleccionCampoObjetivo.value, // Columna llave en fuente
        columns: columns.value, // Columnas a copiar
      },
    });
    console.warn('response', response);
    if (!response.status) {
      throw new Error(`Join falló: ${response.error.status}`);
    }

    // Monitorear el estado
    const checkStatus = async () => {
      const response = await fetch(
        `${config.public.geonodeUrl}/sigic/georeference/status/${seleccionCapaGeo.value}/`
      );
      const { status } = await response.json();
      return status;
    };

    // Esperar a que termine el procesamiento
    let status = await checkStatus();
    while (status === 'STATE_RUNNING') {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos
      masTiempo.value = true;
      status = await checkStatus();
      // console.log('status', status);
    }

    if (status === 'STATE_WAITING') {
      console.log('Proceso completado exitosamente');
    } else {
      console.error('Proceso terminó con estado:', status);
    }
  } catch (error) {
    console.error('Error al unir capas: ', error);
  }
}

// para habilitar o deshabilitar el botón de unir campos
watch(
  [seleccionCampoCapa, seleccionCapaGeo, seleccionCampoObjetivo, dictCamposAUnir],
  ([n1, n2, n3, n4]) => {
    // Si en los cuatro se ha seleccionado algo, habilita el botón
    if (!n1.trim() <= 0 && n2.trim() >= 1 && !n3.trim() <= 0 && Object.values(n4).includes(true)) {
      validarCampos.value = false;
    } else {
      validarCampos.value = true;
    }
  },
  { deep: true }
);

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
  dictCamposAUnir.value = Object.fromEntries(variables.value.map((d) => [d, false]));
});
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
            <div
              v-if="
                titleEditedResource.trim().length >= 1 &&
                layerResources.length > 0 &&
                variables.length > 0
              "
              class="flex"
            >
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

                  <SisdaiSelector
                    v-model="seleccionCapaGeo"
                    etiqueta="Capa objetivo"
                    texto_ayuda="Capa a la que se agregarán las nuevas columnas"
                  >
                    <option v-for="value in layerResources" :key="value.pk" :value="value.pk">
                      {{ value.title }}
                    </option>
                  </SisdaiSelector>

                  <div>
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
                    <div
                      v-if="seleccionCapaGeo.trim() >= 1 && varGeoLayer.length === 0"
                      class="flex flex-contenido-centrado"
                    >
                      <figure>
                        <img
                          class="color-invertir"
                          src="/img/loader.gif"
                          alt="Loader de SIGIC"
                          width="64px"
                        />
                      </figure>
                    </div>
                  </div>

                  <div>
                    <label for="idcolapnavcamposunidos">Campos a unir</label>
                    <SisdaiColapsableNavegacion :colapsado="false">
                      <template #encabezado>Selecciona las opciones que requieres</template>
                      <template #contenido>
                        <div class="columns columns-2">
                          <div>
                            <div
                              v-for="(value, key, index) in dictCamposAUnir"
                              :key="index"
                              class=""
                            >
                              <ClientOnly>
                                <SisdaiCasillaVerificacion
                                  v-model="dictCamposAUnir[key]"
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
                  </div>
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
            <div v-else class="flex flex-contenido-centrado">
              <figure>
                <img
                  class="color-invertir"
                  src="/img/loader.gif"
                  alt="Loader de SIGIC"
                  width="120px"
                />
                <figcaption class="texto-centrado">Cargando información</figcaption>
              </figure>
            </div>
            <div v-if="layerResources.length < 0">
              <p
                class="texto-color-alerta fondo-color-alerta borde borde-color-alerta borde-redondeado-16 p-2"
              >
                No hay capas geográficas publicadas
              </p>
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
                <img class="color-invertir" src="/img/loader.gif" alt="Loader de SIGIC" />
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
