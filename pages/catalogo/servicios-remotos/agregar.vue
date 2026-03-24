<script setup>
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';
import { catalogosSugeridos } from '~/utils/catalogo';

const storeCatalogo = useCatalogoStore();
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});
const config = useRuntimeConfig();

const campoTipo = ref('');
const campoURL = ref('');
const campoNombre = ref('');
const campoDescripcion = ref('');
const responseOk = ref(null);
const importingResources = ref(false);
const tiposFuente = [
  {
    id: 0,
    servicio: 'Detección Automática',
    tipo: 'Detección Automática',
    value: 'AUTO',
  },
  {
    id: 1,
    servicio: 'OGC Web Service Genérico',
    tipo: 'OGC Web Service Genérico',
    value: 'OWS',
  },
  {
    id: 2,
    servicio: 'Web Map Service',
    tipo: 'Web Map Service',
    value: 'WMS',
  },
  {
    id: 3,
    servicio: 'GeoNode Web Map Service',
    tipo: 'GeoNode Web Map Service',
    value: 'GN_WMS',
  },
  {
    id: 4,
    servicio: 'ArcGIS REST MapServer',
    tipo: 'ArcGIS REST MapServer',
    value: 'REST_MAP',
  },
  {
    id: 5,
    servicio: 'ArcGIS REST ImageServer',
    tipo: 'ArcGIS REST ImageServer',
    value: 'REST_IMG',
  },
  {
    id: 6,
    servicio: 'Archivo (csv, json, geojson, xls, xlsx)',
    tipo: 'Archivo (csv, json, geojson, xls, xlsx)',
    value: 'FILE',
  },
];
const isLoading = ref(false);
const error = ref(null);
const route = useRoute();
const selectedServiceId = route.query.id || null;

function irAImportarRecursos() {
  navigateTo({
    path: `/catalogo/explorar/catalogos-externos`,
  });
}

async function validateUrl() {
  const serverType = campoURL.value.toLowerCase().includes('arcgis') ? 'arcgis' : 'ogc';
  const url =
    serverType === 'arcgis'
      ? `${campoURL.value}?f=json`
      : `${campoURL.value}?service=WMS&request=GetCapabilities`;
  let isValid;

  try {
    const fetchUrl = await fetch(url);
    if (!fetchUrl.ok) {
      isValid = false;
    } else if (serverType === 'arcgis') {
      const res = await fetchUrl.json();
      isValid = res.capabilities.includes('Map') || res.capabilities.includes('Image');
    } else {
      const res = await fetchUrl.text();
      isValid = res.includes('GetMap');
    }
  } catch {
    isValid = false;
  }
  return isValid;
}

async function registrar() {
  responseOk.value = null;
  error.value = null;
  isLoading.value = true;
  // Validamos que se tenga la información necesaria
  if (campoURL.value && campoTipo.value && campoNombre.value) {
    if (campoDescripcion.value.trim().length > 2000) {
      error.value = 'La descripción debe tener menos de 2 mil caracteres';
    } else {
      // Hacemos la validación de la url
      const isUrlValid = await validateUrl();
      if (isUrlValid) {
        const { data } = useAuth();
        const token = data.value?.accessToken;

        // Creamos la conexión
        const { responseStatus, message } = await $fetch(
          `${config.public.basePath}/api/registrar-servicio`,
          {
            method: 'POST',
            headers: { token: token },
            body: {
              url: campoURL.value,
              type: campoTipo.value,
              abstract: campoDescripcion.value,
              title: campoNombre.value,
            },
          }
        );
        if (responseStatus === 'error') {
          error.value = message;
        } else {
          responseOk.value = true;
          console.warn('Se registró exitosamente');
        }
      } else {
        error.value = 'Revisa que la url apunte a un servicio válido';
      }
    }
  } else {
    error.value = 'Revisa que todos los campos obligatorios tengan información';
  }
  isLoading.value = false;
}
onMounted(() => {
  if (selectedServiceId) {
    const service = catalogosSugeridos.find((d) => d.id === Number(selectedServiceId));
    campoNombre.value = service.title;
    campoURL.value = service.service_url;
    campoTipo.value = service.tipo;
    campoDescripcion.value = service.abstract
      .split(' ')
      .filter((d) => d !== '')
      .join(' ');
  }
});
</script>

<template>
  <UiLayoutPaneles :estado-colapable="storeCatalogo.catalogoColapsado">
    <template #catalogo>
      <CatalogoListaMenuLateral />
    </template>
    <template #visualizador>
      <main id="principal" class="contenedor ancho-fijo m-b-10">
        <div
          class="columna-10 alineacion-izquierda fondo-color-neutro borde-redondeado-16 m-y-4"
          style="padding: 24px"
        >
          <h2>Conecta un catálogo externo</h2>
          <p>
            Puedes importar recursos de información desde catálogos externos. Para crear una
            conexión necesitas el Servicio URL y el Tipo de servicio, una vez creada la conexión
            podrás explorar los recursos disponibles e importar los que necesites a tus archivos.
          </p>

          <!--Formulario-->
          <form @submit.prevent>
            <ClientOnly class="flex">
              <SisdaiCampoBase
                v-model="campoNombre"
                class="m-y-2"
                etiqueta="Nombre del Servicio remoto"
                ejemplo="Nombre del Servicio remoto"
                :es_obligatorio="true"
                tipo="text"
              />
              <SisdaiCampoBase
                v-model="campoURL"
                etiqueta="Servicio URL"
                ejemplo="URL de servicio externo"
                :es_obligatorio="true"
                tipo="url"
              />
              <SisdaiSelector
                v-model="campoTipo"
                class="m-y-1"
                etiqueta="Tipo de servicio"
                :es_obligatorio="true"
              >
                <option v-for="opcion in tiposFuente" :key="opcion.id" :value="opcion.value">
                  {{ opcion.servicio }}
                </option>
              </SisdaiSelector>
              <SisdaiCampoBase
                v-model="campoDescripcion"
                etiqueta="Descripción del servicio"
                ejemplo="Descripción del servicio"
                :es_obligatorio="false"
                tipo="texto"
                texto_ayuda="Máximo 2 mil caracteres."
              />
            </ClientOnly>

            <!--Validación-->
            <div v-if="isLoading" class="flex flex-contenido-centrado m-y-2">
              <img class="color-invertir" src="/img/loader.gif" alt="...Cargando" height="40px" />
            </div>
            <p
              v-if="error"
              class="flex flex-contenido-separado texto-color-alerta fondo-color-alerta borde borde-redondeado-8 p-1"
            >
              <span><span class="pictograma-alerta"></span>{{ error }}</span>
              <nuxt-link
                v-if="error === 'Ya existe un servicio con esta URL para tu usuario.'"
                to="/catalogo/explorar/catalogos-externos"
                >Explorar Catálogos Externos</nuxt-link
              >
            </p>

            <div class="flex flex-contenido-inicio m-t-3">
              <button
                class="boton-primario boton-chico"
                aria-label="Crear conexión de catálogo externo"
                type="button"
                @click="registrar"
              >
                Crear conexión
              </button>
            </div>
          </form>
        </div>

        <!--Alertas de registro de harvester-->
        <div v-if="responseOk">
          <p
            class="flex flex-contenido-separado texto-color-confirmacion fondo-color-confirmacion p-1 borde borde-color-confirmacion borde-redondeado-8"
          >
            <span> <span class="pictograma-aprobado" />La conexión remota tuvo éxito </span>
            <nuxt-link @click="irAImportarRecursos">Explorar Servicios Remotos</nuxt-link>
          </p>
        </div>
        <div v-if="responseOk === false">
          <p
            class="flex flex-contenido-separado texto-color-error fondo-color-error p-1 borde borde-color-error borde-redondeado-8"
          >
            <span>
              <span class="pictograma-alerta" />No se pudo registrar este servicio. Revisa tu
              conexión e intentalo de nuevo más tarde.</span
            >
          </p>
        </div>
        <div v-if="importingResources" class="m-y-2">
          <div
            class="flex flex-contenido-inicio texto-color-informacion fondo-color-informacion p-1 borde borde-color-informacion borde-redondeado-8"
          >
            <div class="flex-vertical-centrado columna-2">
              <img src="/img/loader.gif" alt="...Cargando" class="loader color-invertir" />
            </div>
            <p class="columna-14">
              Estamos obteniendo los recursos del catálogo registrado. Este proceso puede demorar
              unos minutos.
            </p>
          </div>
        </div>
      </main>
    </template>
  </UiLayoutPaneles>
</template>
<style lang="scss" scoped>
.loader {
  max-height: 4em;
  object-fit: scale-down;
}
</style>
