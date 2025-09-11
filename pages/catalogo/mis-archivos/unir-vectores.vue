<script setup>
import SisdaiCasillaVerificacion from '@centrogeomx/sisdai-componentes/src/componentes/casilla-verificacion/SisdaiCasillaVerificacion.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

import { getWMSserver, hasWMS, resourceTypeDic } from '~/utils/consulta';

const storeFetched = useFetchedResources2Store();
storeFetched.checkFilling(resourceTypeDic.dataLayer);

const route = useRoute();

const { data } = useAuth();
const token = data.value?.accessToken;
const userEmail = data.value?.user.email;

const resourcesCapas = computed(
  () =>
    storeFetched
      .byResourceType(resourceTypeDic.dataLayer)
      .filter((resource) => resource.owner.email === userEmail) || {}
);
const resourceLayer = ref({});
const seleccionCampoCapa = ref('');
const seleccionCapaGeo = ref('');
const seleccionCampoObjetivo = ref('');
const campoUnidos = ref(false);
const dict = ref({});
const unionExitosa = ref(false);

/**
 * Obtiene la data del query route de la vista de donde viene.
 * @returns {Object} objeto decodificado con la propiedad de pk
 */
function getUserData() {
  if (route.query.data) {
    try {
      const dataStr = decodeURIComponent(route.query.data);
      return computed(() => JSON.parse(dataStr));
    } catch (e) {
      console.error('Error al parsear el objeto', e);
      return null;
    }
  }
}
const objetoId = ref(getUserData());

// obtener el resource completo a partir del id
resourceLayer.value = await $fetch('/api/objeto', {
  method: 'POST',
  body: { id: objetoId.value.pk },
});

const variables = ref([]);
const varGeoLayer = ref([]);
const config = useRuntimeConfig();
const proxy = `${config.public.geonodeUrl}/proxy/?url=`;

const obtenerVariables = async (resource) => {
  // const url = new URL(`${config.public.geoserverUrl}/ows`);
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

  // const res = await fetch(url);
  let res;
  if (resource.sourcetype === 'REMOTE') {
    res = await fetch(proxy + `${encodeURIComponent(url)}`);
  } else if (!token) {
    res = await fetch(url);
  } else if (token) {
    res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    //console.log(res);
  }

  const datas = await res.json();
  const atributos = datas.features.map((f) => f.properties);
  return Object.keys(atributos[0] || {});
};
variables.value = await obtenerVariables(resourceLayer.value);

// evitar problemas con espacios con JSON.stingify
const pk = ref(encodeURIComponent(JSON.stringify({ pk: resourceLayer.value.pk })));
function irAMetadatosConQuery() {
  navigateTo({
    path: '/catalogo/mis-archivos/editar-metadatos',
    query: { data: pk.value },
  });
}
function irAClaveConQuery() {
  navigateTo({
    path: '/catalogo/mis-archivos/unir-vectores',
    query: { data: pk.value },
  });
}

watch(seleccionCapaGeo, (nv) => {
  (async () => {
    const filterPkResourcesCapas = resourcesCapas.value.filter((resource) => resource.pk === nv)[0];
    // Tiene que estar publicada la capa geográfica
    varGeoLayer.value = await obtenerVariables(filterPkResourcesCapas);

    dict.value = Object.fromEntries(variables.value.map((d) => [d, false]));
  })();
});

// TODO: unir vectores con el backend
async function unirCampos() {
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
    layer: resourceLayer.value.pk,
    layer_pivot: seleccionCampoCapa.value,
    // token: data.value?.accessToken,
  });
  // await $fetch('/api/join', {
  //   method: 'POST',
  //   body: {
  //     layer: resourceLayer.value.pk,
  //     geo_layer: resourceGeo.value.pk,
  //     layer_pivot: seleccionCapa.value,
  //     geo_pivot: seleccionCapaGeo.value,
  //     columns: columns.value,
  //     token: data.value?.accessToken,
  //   },
  // });
  unionExitosa.value = true;
}

// para habilitar o deshabilitar el botón de unir campos
const validarCampos = ref(true);
watch([seleccionCampoCapa, seleccionCapaGeo, seleccionCampoObjetivo], ([n1, n2, n3]) => {
  // Si en los tres se ha seleccionado algo, habilita el botón
  if (!n1.trim() <= 0 && n2.trim() >= 1 && !n3.trim() <= 0) {
    validarCampos.value = false;
  } else {
    validarCampos.value = true;
  }
});

const bordeEnlaceActivo = (ruta) => {
  if (route.path === ruta) {
    return 'borde-enlace-activo';
  }
  return '';
};
</script>

<template>
  <UiLayoutPaneles>
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

          <div class="flex m-t-3">
            <nuxt-link
              :class="bordeEnlaceActivo('/catalogo/mis-archivos/editar-metadatos')"
              @click="irAMetadatosConQuery"
              >Metadatos
            </nuxt-link>
            <nuxt-link
              :class="bordeEnlaceActivo('/catalogo/mis-archivos/unir-vectores')"
              @click="irAClaveConQuery"
              >Clave Geoestadística
            </nuxt-link>
          </div>
          <div class="borde-b borde-color-secundario"></div>

          <p>
            Agrega a tus datos tabulados un campo geoespacial. Esto permitirá convertirlo en un
            archivo de capa geográfica (.shp, .geojson, entre otros), haciéndolo compatible con el
            visor de mapas y otras herramientas de análisis espacial dentro de SIGIC.
          </p>

          <div
            v-if="unionExitosa"
            class="fondo-color-confirmacion texto-color-confirmacion borde borde-color-confirmacion borde-redondeado-16 p-x-2 m-t-2"
          >
            <p>
              <span class="pictograma-aprobado" />
              Se ha agregado el campo con éxito, ya puedes visualizar tu archivo como capa.
            </p>
          </div>

          <!-- Formulario -->
          <div class="m-t-3">
            <div class="flex">
              <div class="columna-16">
                <h3>{{ resourceLayer.title }}</h3>

                <ClientOnly>
                  <!-- Selector de campo capa base -->
                  <SisdaiSelector
                    v-model="seleccionCampoCapa"
                    etiqueta="Tipo de Clave Geoestadística"
                  >
                    <option v-for="value in variables" :key="value" :value="value">
                      {{ value }}
                    </option>
                  </SisdaiSelector>

                  <!-- Selector de Capa geo -->
                  <p v-if="resourcesCapas.length === 0">...cargando capas</p>
                  <SisdaiSelector
                    v-if="resourcesCapas.length > 0"
                    v-model="seleccionCapaGeo"
                    etiqueta="Capa objetivo"
                  >
                    <option v-for="value in resourcesCapas" :key="value.pk" :value="value.pk">
                      {{ value.title }}
                    </option>
                  </SisdaiSelector>

                  <!-- Selector de campo Capa objetivo -->
                  <p v-if="seleccionCapaGeo.trim() >= 1 && varGeoLayer.length === 0">
                    ...cargando campos
                  </p>
                  <SisdaiSelector
                    v-if="varGeoLayer.length > 0"
                    v-model="seleccionCampoObjetivo"
                    etiqueta="Campo objetivo"
                  >
                    <option v-for="value in varGeoLayer" :key="value" :value="value">
                      {{ value }}
                    </option>
                  </SisdaiSelector>
                </ClientOnly>

                <ul class="lista-sin-estilo">
                  <li>
                    <ClientOnly>
                      <SisdaiCasillaVerificacion
                        v-if="varGeoLayer.length > 0"
                        v-model="campoUnidos"
                        etiqueta="Campos unidos"
                      />
                    </ClientOnly>
                  </li>
                  <ul v-if="campoUnidos" class="lista-sin-estilo borde">
                    <li v-for="(value, key, index) in dict" :key="index" class="p-l-2">
                      <ClientOnly>
                        <SisdaiCasillaVerificacion v-model="dict[key]" :etiqueta="key" />
                      </ClientOnly>
                    </li>
                  </ul>
                </ul>
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
    </template>
  </UiLayoutPaneles>
</template>

<style lang="scss" scoped>
.borde-enlace-activo {
  border-bottom: 4px solid var(--boton-primario-borde);
  border-radius: 0px;
}
</style>
