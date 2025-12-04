<script setup>
import { wait } from '@/utils/consulta';
import SisdaiCampoBase from '@centrogeomx/sisdai-componentes/src/componentes/campo-base/SisdaiCampoBase.vue';
import SisdaiSelector from '@centrogeomx/sisdai-componentes/src/componentes/selector/SisdaiSelector.vue';

const storeCatalogo = useCatalogoStore();
definePageMeta({
  middleware: 'sidebase-auth',
  bodyAttrs: {
    class: '',
  },
});
const config = useRuntimeConfig();
const { gnoxyFetch } = useGnoxyUrl();
const selecTipoFuente = ref('');
const campoURL = ref('');
const campoNombre = ref('');
const responseOk = ref(null);
const harvesterStatus = ref(null);
const importingResources = ref(false);
const newHarvester = ref();
const opTipoFuente = [
  {
    id: 0,
    servicio: 'Servicio de Mapas Web',
    tipo: 'WMS',
    value: 'geonode.harvesting.harvesters.wms.OgcWmsHarvester',
  },
  {
    id: 1,
    servicio: 'Geonode (servicios de Mapas Web)',
    tipo: 'GN_WMS',
    value: 'geonode.harvesting.harvesters.wms.OgcWmsHarvester',
  },
  {
    id: 2,
    servicio: 'Servicio ArcGIS REST MapServer',
    tipo: 'REST_MAP',
    value: 'geonode.harvesting.harvesters.arcgis.ArcgisHarvesterWorker',
  },
  {
    id: 3,
    servicio: 'Servcio ArcGIS REST ImageServer',
    tipo: 'REST_IMG',
    value: 'geonode.harvesting.harvesters.arcgis.ArcgisHarvesterWorker',
  },
  /* { id: 4, servicio: 'El nuevo', tipo: 'FILE' }, */
];

function irAImportarRecursos() {
  navigateTo({
    path: `/catalogo/servicios-remotos/importar`,
    query: {
      // TODO: al cargar el recurso recuperar estos valores
      id: newHarvester.value?.id,
      title: newHarvester.value?.name,
      //unique_identifier: 'v.unique_identifier',
      //remote_resource_type: 'v.remote_resource_type',
    },
  });
}

async function crearConexion() {
  const { data } = useAuth();
  const token = data.value?.accessToken;
  if (campoURL.value && selecTipoFuente.value) {
    // Creamos la conexión
    const { responseStatus, responseObject } = await $fetch('/api/externo', {
      method: 'POST',
      headers: { token: token },
      body: { name: campoNombre.value, url: campoURL.value, type: selecTipoFuente.value },
    });
    responseOk.value = responseStatus;
    newHarvester.value = responseObject.harvester;
    //console.log('RespuestaRegistro:', responseOk.value);
    //console.log('InfoHarvester:', newHarvester.value);

    //Si la conexión se creó exitosamente, solicitamos la obtención de los recursos
    if (responseOk.value && Object.keys(newHarvester.value).length > 0) {
      // Actualizamos el estatus
      const harvesterID = newHarvester.value.id;
      console.warn('newHarvesterID', harvesterID);
      importingResources.value = true;
      const updateStatus = await $fetch('/api/actualizar-externo', {
        method: 'POST',
        headers: { token: token },
        body: { id: harvesterID, status: 'updating-harvestable-resources' },
      });
      console.warn('Update harvester status', updateStatus);
      if (!updateStatus) {
        importingResources.value = false;
        return;
      } else {
        // Si la actualización de estatus funciona, esperamos el momento en que se termine de solicitar los recursos
        do {
          const res = await gnoxyFetch(`${config.public.geonodeApi}/harvesters/${harvesterID}`);
          const info = await res.json();
          harvesterStatus.value = info.harvester.status;
          console.warn('Harvester Status:', harvesterStatus.value);

          if (harvesterStatus.value === 'ready') break;

          await wait(5000);
        } while (harvesterStatus.value !== 'ready');
        importingResources.value = false;
      }

      return;
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
          <form @submit.prevent>
            <ClientOnly class="flex">
              <SisdaiCampoBase
                v-model="campoNombre"
                etiqueta="Nombre del Servicio remoto"
                ejemplo="Nombre del Servicio remoto"
                class="m-y-2"
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
                v-model="selecTipoFuente"
                class="m-y-1"
                etiqueta="Tipo de servicio"
                :es_obligatorio="true"
              >
                <option v-for="opcion in opTipoFuente" :key="opcion.id" :value="opcion.value">
                  {{ opcion.servicio }}
                </option>
              </SisdaiSelector>
            </ClientOnly>
            <div class="flex flex-contenido-inicio m-t-3">
              <button
                class="boton-primario boton-chico"
                aria-label="Crear conexión de catálogo externo"
                type="button"
                @click="crearConexion"
              >
                Crear conexión
              </button>
            </div>
          </form>
        </div>

        <div v-if="responseOk">
          <p
            class="flex flex-contenido-separado texto-color-confirmacion fondo-color-confirmacion p-1 borde borde-color-confirmacion borde-redondeado-8"
          >
            <span> <span class="pictograma-aprobado" />La conexión remota tuvo éxito </span>
            <nuxt-link @click="irAImportarRecursos">Ir a importar recursos</nuxt-link>
          </p>
        </div>
        <div v-if="responseOk === false">
          <p
            class="flex flex-contenido-separado texto-color-error fondo-color-error p-1 borde borde-color-confirmacion borde-redondeado-8"
          >
            <span> <span class="pictograma-alerta" />No se pudo registrar este servicio.</span>
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
